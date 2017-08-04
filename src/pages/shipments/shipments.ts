import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { UserAccount, UserAccountOperator } from '../../models/user-model';
import { SendingsPage } from '../sendings/sendings';
import { AlertController } from 'ionic-angular';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { ShipmentDetailPage } from '../shipment-detail/shipment-detail';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';

@Component({
    selector: 'page-shipments',
    templateUrl: 'shipments.html',
})
export class ShipmentsPage implements OnInit{

    // operatorAuth flags
    operatorAuthUnchecked:any;
    // account
    accountSubs: Subscription;
    account: UserAccount;
    operator: UserAccountOperator;
    // list
    shipments:any;
    shipmentsEmpty:boolean;
    // list observer
    shipmentsSuscription:any;  

    constructor(private navCtrl: NavController,
        public shipmentsSrv:ShipmentsService,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        private accountSrv: AccountService) {}

    ngOnInit() {
        console.info('__shipment__');
        this.operatorAuthUnchecked = true;
        this.setAccount();  
    }

    ionViewWillLeave() {
        console.log('shipments leaving ..');
        if(this.accountSubs) {
            console.log('unsubscribed');
            this.accountSubs.unsubscribe();
        }
    }


    /**
     *  PRIVATE
     */


    private setAccount() {
        let obs = this.accountSrv.getObs(true);
        this.accountSubs = obs.subscribe((snap) => {
            this.account = snap.val();
            this.operator = this.account.operator;
            this.operatorAuthUnchecked = false;
            console.log('set account', this.account, this.operator, this.operatorAuthUnchecked);
        },
        err => {
            console.log(err);
        });
    }



}
