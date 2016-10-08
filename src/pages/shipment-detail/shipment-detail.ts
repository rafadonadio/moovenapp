import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage {

  shipmenttab: string = "state";

  constructor(public navCtrl: NavController) {

  }

  goToTab(tab: string) {
    this.shipmenttab = tab;
  }

}
