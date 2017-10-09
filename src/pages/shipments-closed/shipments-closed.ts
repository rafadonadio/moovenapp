import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-shipments-closed',
    templateUrl: 'shipments-closed.html',
})
export class ShipmentsClosedPage {

    constructor(public navCtrl: NavController, 
        public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ShipmentsClosedPage');
    }

}
