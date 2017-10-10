import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { UserAccount, UserAccountOperator } from '../../models/user-model';
import { AlertController, ToastController } from 'ionic-angular';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { Component } from '@angular/core';
import { App, NavController, ViewController } from 'ionic-angular';
import { ShipmentDetailPage } from '../shipment-detail/shipment-detail';
import { ShipmentCreatePage } from '../shipment-create/shipment-create';
import { FirebaseListObservable } from 'angularfire2/database-deprecated';

@Component({
    selector: 'page-shipments-active',
    templateUrl: 'shipments-active.html',
})
export class ShipmentsActivePage {


    // operatorAuth flags
    operatorAuthUnchecked:any;
    // account
    accountSubs: Subscription;
    account: UserAccount;
    operator: UserAccountOperator;
    // list
    shipments:FirebaseListObservable<any>;

    constructor(private navCtrl: NavController,
        public shipmentSrv:ShipmentsService,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        private accountSrv: AccountService,
        private toastCtrl: ToastController,
        private app: App) {}

    ngOnInit() {
        console.info('__shipment__');
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

    goToDetail(data:any) {
        console.log('go to detail > ', data.shipmentId);
        this.app.getRootNavs()[0].push(ShipmentDetailPage, { 
            shipmentId: data.shipmentId,
            sendingId: data.sendingId,
        });         
    }

    goToCreate() {
        if(this.operator.active) {
            this.app.getRootNavs()[0].setRoot(ShipmentCreatePage);
        }else{
            this.toastNotAvailable();
        }
    }

    getStatusMessage(currentStageStatus) {
        let message = '';
        switch(currentStageStatus){
            case 'live_gotoperator':
            case 'live_waitpickup':
                message = 'Retirar';
                break;
            case 'live_pickedup':                
            case 'live_inroute':
                message = 'Entregar';
                break;                
            case 'live_dropped':
            case 'closed_completed':
                message = 'Entregado';
                break;                             
        }
        return message;
    }    

    /**
     *  PRIVATE
     */  

    private init() {
        this.setAccount()
            .then(() => {
                this.getAllActive();
            });
    }

    private getAllActive() {
        this.shipments = this.shipmentSrv.getAllActiveObs();
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

    private toastNotAvailable() {
        let toast = this.toastCtrl.create({
                message: 'Función no disponible',
                duration: 2000
            });
        toast.present();
    }

}
