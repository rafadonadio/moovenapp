import { HelpPage } from '../help/help';
import { SettingsPage } from '../settings/settings';
import { ShipmentsTabsPage } from '../shipments-tabs/shipments-tabs';
import { SendingsTabsPage } from '../sendings-tabs/sendings-tabs';
import { AccountService } from '../../providers/account-service/account-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { APP_CFG } from '../../models/app-model';
import { Subscription } from 'rxjs/Rx';
import { UserAccount, UserAccountOperator } from '../../models/user-model';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {

    // operatorAuth flags
    operatorAuthUnchecked:any;
    // account
    accountSubs: Subscription;
    account: UserAccount;
    operator: UserAccountOperator;
    // 
    appName:string = APP_CFG.ENVIRONMENTS[APP_CFG.CURRENT_ENV].APP_NAME;
    sendings:any;
    shipments:any;

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private sendingSrv: SendingService,
        private accountSrv: AccountService) {
    }

    ionViewWillEnter() {
        this.operatorAuthUnchecked = true;
        this.init();  
    }

    private init() {
        this.getActiveSendings();        
        this.setAccount()
            .then(() => {
                this.getActiveShipments();
            });
    }    

    private setAccount(): Promise<any> {
        return new Promise((resolve, reject) => {
            let obs = this.accountSrv.getObs(true);
            this.accountSubs = obs.subscribe((snap) => {
                this.account = snap.val();
                this.operator = this.account.operator;
                this.operatorAuthUnchecked = false;
                console.log('set account', this.account, this.operator, this.operatorAuthUnchecked);
                resolve();
            },
            err => {
                console.log(err);
                reject();
            });
        });
    }    

    goToSendings() {
        this.navCtrl.setRoot(SendingsTabsPage);
    }
    goToShipments() {
        this.navCtrl.setRoot(ShipmentsTabsPage);
    } 
    goToHelp() {
        this.navCtrl.setRoot(HelpPage);
    } 
    goToSettings() {
        this.navCtrl.setRoot(SettingsPage);
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
