import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ShipmentCreate2Page } from '../shipment-create-2/shipment-create-2';

@Component({
    templateUrl: 'shipment-create.html',
})
export class ShipmentCreatePage {

    constructor(public navCtrl: NavController) {

    }

    goToCreate2() {
        this.navCtrl.push(ShipmentCreate2Page);
    }

}
