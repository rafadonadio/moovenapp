import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ShipmentDetailPage } from '../shipment-detail/shipment-detail';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

@Component({
    templateUrl: 'shipments.html',
})
export class ShipmentsPage {

    constructor(private navCtrl: NavController) {

    }

    goToDetail() {
        this.navCtrl.push(ShipmentDetailPage);
    }

    goToCreate() {
        this.navCtrl.push(ShipmentCreatePage);
    }

}
