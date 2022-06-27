import { Component, AfterViewInit, HostListener } from '@angular/core';

import { NotificationService } from 'src/app/services/notification.service';
import { BlockchainService } from '../../services/blockchain.service';
import * as b from 'bignumber.js'
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements AfterViewInit {

  public mintPrice: number = 0;
  public quantity: number | any;
  public publicAddress: string = '';

  public isGetMintPriceDone: boolean = false;
  public isValidQuantity: boolean = true;
  public isSubmitting: boolean = false;

  public openSeaLink: string = environment.openSeaLink;
  public smartContractLink: string = environment.smartContractLink;

  @HostListener('document:mousemove', ['$event'])
  mousemove(e: any) {
    document.querySelectorAll('.layer').forEach((layer: any) => {
      const speed = layer.getAttribute('data-speed')

      const x = (window.innerWidth - e.pageX * speed) / 100
      const y = (window.innerHeight - e.pageY * speed) / 100

      layer.style.transform = `translateX(${x}px) translateY(${y}px)`
    })
  }

  constructor(
    private blockchainService: BlockchainService,
    private notifyService: NotificationService
  ) { }

  ngAfterViewInit(): void {
    this.backgroundRotate();
    const tempPublicAddress = localStorage.getItem('_publicAddress');
    if(tempPublicAddress) {
      this.connect();
    }
  }

  async connect() {
    if(this.publicAddress) return;
    const publicAddress = await this.blockchainService.connectAccount();
    if(publicAddress) {
      this.publicAddress = publicAddress;
      localStorage.setItem('_publicAddress', this.publicAddress);
    }
  }

  async getMintPrice() {
    try {
      const balance: any = await this.blockchainService.getMintPrice();
      this.mintPrice = Number(balance._hex) / (10 ** 18); // Hex to Wei
      this.isGetMintPriceDone = true;
    } catch (err: any) {
      this.notifyService.showError((err?.error?.message || err?.message || err) + "", "Blockchain Error")
    }
  }

  isValidQuantityEnter(quantityError: any, type: string) {
    return quantityError.errors[type];
  }

  convertToBigNumber(value: number) {
    return (new b.BigNumber(value)).toFixed();
  }

  getConvertedEth() {
    let newPrice = this.mintPrice * (this.quantity && this.quantity >= 1 ? parseInt(this.quantity) : 1);
    return this.convertToBigNumber(newPrice);
  }

  async mintNow() {
    if(this.quantity <= 0) return;
    let newPrice = this.mintPrice * (this.quantity && this.quantity >= 1 ? parseInt(this.quantity) : 1);
    let payableAmount: any = newPrice * (10 ** 18);
    payableAmount = (new b.BigNumber(payableAmount)).toString(16);
    if(payableAmount.indexOf('0x') != 0) {
      payableAmount = '0x' + payableAmount;
    }
    try {
      this.isSubmitting = true;
      const isActivated: boolean = await this.blockchainService.mint(
        payableAmount,
        parseInt(this.quantity)
      );
      this.isSubmitting = false;
      if (isActivated) {
        this.notifyService.showSuccess('Successfully minted.', "Blockchain");
        this.closeMintDialog('modal');
      }
    } catch (err: any) {
      // console.error(err);
      this.isSubmitting = false;
      this.notifyService.showError((err?.error?.message || err?.message || err) + "", "Blockchain Error");
    }

  }

  openMintDialog(id: string) {
    if(this.publicAddress) {
      let element: any = document.getElementById(id);
      element.classList.add("animate-modal");
      this.getMintPrice();
    } else {
      this.notifyService.showInfo('Please connect first with your MetaMask Account', 'Info');
    }
  }
  closeMintDialog(id: string) {
    this.quantity = null;
    let element: any = document.getElementById(id);
    element.classList.remove("animate-modal");
  }

  backgroundRotate() {
    document.querySelectorAll('.background-slide').forEach((layer: any) => {
      let position = 0;
      setInterval(() => {
        layer.style.backgroundPosition = `${position}px ${position}px`
        if (position === 39) {
          position = 0
        } else {
          position++;
        }
      }, 50)
    })
  }

}
