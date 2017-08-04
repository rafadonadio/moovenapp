import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { UserAccount, UserAccountOperator } from '../../models/user-model';
import { SendingsPage } from '../sendings/sendings';
import { AlertController, ToastController } from 'ionic-angular';
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
        private accountSrv: AccountService,
        private toastCtrl: ToastController) {}

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

    goToDetail(data:any) {
        console.log('go to detail > ', data.shipmentId);
        this.navCtrl.push(ShipmentDetailPage, { 
            shipmentId: data.shipmentId,
            sendingId: data.sendingId,
        });         
    }

    goToCreate() {
        if(this.operator.active) {
            this.navCtrl.setRoot(ShipmentCreatePage);
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

    private getAllActive() {
        let listRef = this.shipmentsSrv.getAllMyActiveRef();
        this.shipmentsSuscription = listRef.subscribe(snapshots => {
                console.log('__SHP__ getAllActive');                
                this.shipments = [];
                if(snapshots) {
                    snapshots.forEach(snapshot => {
                        let key = snapshot.key;
                        let item = {
                            key: key,
                            data: snapshot.val(),
                        };
                        this.shipments.push(item); 
                    });
                }
                if(this.shipments.length > 0) {
                    this.shipmentsEmpty = false;
                }else{
                    this.shipmentsEmpty = true;
                }
            });
    }     

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

    private toastNotAvailable() {
        let toast = this.toastCtrl.create({
                message: 'Función no disponible',
                duration: 2000
            });
        toast.present();
    }


}
