import { Component } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';

@Component({
    selector: 'modal-tos',
    templateUrl: 'modal-tos.html',
})
export class ModalTosPage {

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController) {

    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}