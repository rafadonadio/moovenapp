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

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private sendingSrv: SendingService) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HomePage');
        this.getActiveSendings();
    }

    goToSendings() {
        this.navCtrl.setRoot(SendingsTabsPage);
    }

    private getActiveSendings() {
        this.sendings = this.sendingSrv.getAllActiveObs();
    }

    getStatusMessage(currentStageStatus:string) {
        return this.sendingSrv.getStatusMessage(currentStageStatus);
    }

}
