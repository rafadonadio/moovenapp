import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { UserAccount, UserAccountOperator } from '../../models/user-model';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-shipments-closed',
    templateUrl: 'shipments-closed.html',
})
export class ShipmentsClosedPage {

    // operatorAuth flags
    operatorAuthUnchecked:any;
    // account
    accountSubs: Subscription;
    account: UserAccount;
    operator: UserAccountOperator;
    // list    
    shipments:any;

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private shipmentSrv: ShipmentsService,
        private accountSrv: AccountService) {
    }

    ionViewWillEnter() {
        this.operatorAuthUnchecked = true;
        this.init();  
    }

    ionViewWillLeave() {
        console.log('shipments leaving ..');
        this.shipments = null;
        if(this.accountSubs) {
            console.log('unsubscribed');
            this.accountSubs.unsubscribe();
        }
    }

    getStatusMessage(currentStageStatus):string{
        return this.shipmentSrv.getStatusMessage(currentStageStatus);
    }

    /**
     *  PRIVATE
     */  

    private getAllClosed() {
        this.shipments = this.shipmentSrv.getAllClosedObs();
    }

    private init() {
        this.setAccount()
            .then(() => {
                this.getAllClosed();
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

}
