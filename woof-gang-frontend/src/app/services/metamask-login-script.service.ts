import { Injectable } from "@angular/core";

declare var document: any;

@Injectable({
  providedIn: 'root'
})
export class MetamaskLoginScriptService {

  constructor() { }

  loadScript() {
    const src = "./assets/js/metamask-logo.js"
    return new Promise((resolve, reject) => {

      //load script
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      if (script.readyState) {  //IE
        script.onreadystatechange = () => {
          if (script.readyState === "loaded" || script.readyState === "complete") {
            script.onreadystatechange = null;
            // this.isLoaded = true;
            resolve({ loaded: true, status: 'Loaded' });
          }
        };
      } else {  //Others
        script.onload = () => {
          // this.isLoaded = true;
          resolve({ loaded: true, status: 'Loaded' });
        };
      }
      script.onerror = (error: any) => resolve({ loaded: false, status: 'Loaded' });
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }
}
