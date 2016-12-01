import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-shipment-detail',  
    templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage {

    shipmenttab: string = "notifications";
    sending:any;
    shipment:any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams) {
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        this.shipment = this.navParams.get('shipment');
    }

    goToTab(tab: string) {
        this.shipmenttab = tab;
    }

}
