import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-shipments-notifications',
    templateUrl: 'shipments-notifications.html',
})
export class ShipmentsNotificationsPage {

    constructor(public navCtrl: NavController, 
        public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ShipmentsNotificationsPage');
    }

}
