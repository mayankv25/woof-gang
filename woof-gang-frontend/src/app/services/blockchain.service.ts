import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from './notification.service';
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers";
import { environment } from "../../environments/environment";
// import { AuthService } from './auth.service';
import { Web3Provider } from '@ethersproject/providers';
import UtilityContract from '../../assets/abi/utility.json'
// import { } from '../model/data.model';

declare var window: any;
// declare var Web3: any;

@Injectable({
  providedIn: 'root'
})
export class BlockchainService {
  currentAccount: string = "";
  provider?: Web3Provider | null;

  private accountStatusSource = new Subject<any>();
  accountStatus = this.accountStatusSource.asObservable();

  constructor(
    private notifyService: NotificationService,
    // private authService: AuthService
  ) { }

  async setup() {
    // Check if MetaMask is installed

    if (!this.provider) {
      this.provider = await BlockchainService.getWebProvider()
    }

    if (!this.provider) {
      this.notifyService.showInfo('Please install MetaMask extension first.', 'MetaMask')
      return;
    }

    // if (this.provider !== window.ethereum) {
    //   this.notifyService.showError('Multiple wallets detected. Do you have multiple wallets installed?', 'MetaMask')
    //   return;
    // }

    const signer = await this.provider?.getSigner()
    const coinbase: string | undefined = await signer?.getAddress()

    if (!coinbase) {
      this.notifyService.showInfo('Please activate MetaMask first.', 'MetaMask')
      return;
    }
    this.currentAccount = coinbase

    this.provider.on('chainChanged', this.handleChainChanged);
    this.provider.on('accountsChanged', this.handleAccountsChanged);

  }

  async connectAccount() {
    await this.setup()
    return this.currentAccount
  }

  async handleSignMessage(nonce: string) {
    try {
      const signer = await this.provider?.getSigner()
      const signature = await signer?.signMessage(`I am signing my one-time nonce: ${nonce}`)

      return signature || "";
    } catch (err) {
      throw new Error(
        'You need to sign the message to be able to log in.'
      );
    }
  }

  private handleChainChanged() {
    // We recommend reloading the page, unless you must do otherwise
    // this.authService.destroySession()
    window.location.reload();
  }

  private handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      this.notifyService.showInfo('Please connect to MetaMask.', 'MetaMask')
    } else if (accounts.length > 0 && accounts[0] !== this.currentAccount) {
      this.currentAccount = accounts[0];
      // this.authService.destroySession()
      window.location.reload();
    }
  }

  public async getMintPrice(): Promise<string> {
    const contract = await BlockchainService.getContract(true)

    const transaction = await contract[BLOCKCHAIN_ABI_SMART_CONTRACT_METHODS.MINT_PRICE]()

    return transaction
  }

  public async mint(payableAmount: string, quantity: number): Promise<boolean> {
    const contract = await BlockchainService.getContract(true)

    const transaction = await contract[BLOCKCHAIN_ABI_SMART_CONTRACT_METHODS.MINT](
      quantity,
      {
        value: payableAmount,
        // value: '0xDE0B6B3A7640000'
      },
    )

    const tx = await transaction.wait()

    return tx.status === 1
  }

  private static async getContract(bySigner = false) {
    const provider = await BlockchainService.getWebProvider()
    const signer = provider?.getSigner()

    return new ethers.Contract(
      environment.contractAddress,
      UtilityContract.abi,
      bySigner ? signer : provider!,
    )
  }

  private static async getWebProvider(requestAccounts = true) {
    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: true
    })

    if (requestAccounts && provider) {
      await provider.request({ method: 'eth_requestAccounts' })
    }

    return provider ? new ethers.providers.Web3Provider(provider) : null
  }

}

export const enum BLOCKCHAIN_ABI_SMART_CONTRACT_METHODS {
  MINT_PRICE = "mintPrice",
  MINT = "mint",
  ADD_NEW_ARTIST = "addNewArtist"
}