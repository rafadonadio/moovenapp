import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'modal-tos.html',
})
export class ModalTosPage {

  constructor(private navCtrl: NavController,
      public viewCtrl: ViewController) {

  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
