import { ShipmentsTabsPage } from '../shipments-tabs/shipments-tabs';
import { SendingsTabsPage } from '../sendings-tabs/sendings-tabs';
import { SendingService } from '../../providers/sending-service/sending-service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { APP_CFG } from '../../models/app-model';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {

    appName:string = APP_CFG.ENVIRONMENTS[APP_CFG.CURRENT_ENV].APP_NAME;
    sendings:any;
    shipments:any;

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private sendingSrv: SendingService) {
    }

    ionViewWillLoad() {
        console.log('ionViewDidLoad HomePage');
        this.getActiveSendings();
        this.getActiveShipments();
    }

    goToSendings() {
        this.navCtrl.setRoot(SendingsTabsPage);
    }
    goToShipments() {
        this.navCtrl.setRoot(ShipmentsTabsPage);
    }    

    private getActiveSendings() {
        this.sendings = this.sendingSrv.getAllActiveObs();
    }

    private getActiveShipments() {
        this.shipments = [];
    }

    getStatusMessage(currentStageStatus:string) {
        return this.sendingSrv.getStatusMessage(currentStageStatus);
    }

}
