import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { LoadingController } from 'ionic-angular';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import { SendingRequest } from '../../models/sending-model';
import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, NavController, NavParams, ViewController } from 'ionic-angular';

const NOTIFICATIONS_LIST = SHIPMENT_CFG.NOTIFICATIONS_TO_SHOW;

@Component({
    selector: 'page-shipment-detail',  
    templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage implements OnInit {

    shipmenttab: string = "notifications";
    shipmentId:string;
    sendingId:string;
    senderId:string;    
    sending:SendingRequest;
    shipment:any;
    sender:any;
    shipmentSubs:any;
    sendingSubs:Subscription;
    senderSubs:Subscription;
    notifications:Array<any>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public actionShCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public sendingSrv: SendingService,
        public shipmentSrv: ShipmentsService,
        public viewCtrl: ViewController,
        public loadingCtrl: LoadingController,
        private accountSrv: AccountService) {
    }

    ngOnInit() {

    }

    ionViewWillEnter() {
        console.info('get params');
        this.shipmentId = this.navParams.get('shipmentId');
        this.sendingId = this.navParams.get('sendingId');
        // get shipment/sending 
        let loader = this.loadingCtrl.create({ content: "Cargando ..." });     
        let shObs = this.shipmentSrv.getShipment(this.shipmentId);
        this.shipmentSubs = shObs.subscribe(snapshot => {
            this.shipment = snapshot.val();
            loader.dismiss();
        })
        let obs = this.sendingSrv.getSendingObs(this.sendingId, true);
        this.sendingSubs = obs.subscribe(snapshot => {
            this.sending = snapshot.val();
            this.filterAndConvertNotificationsToArray();
            let obs = this.accountSrv.getObs(true);
            this.senderSubs = obs.subscribe((snap) => {
                    let account = snap.val();
                    this.sender = account.profile.data;
                });                
        });           
    }    

    ionViewWillLeave() {
        console.log('__SHD__didLeave()');
        if(this.shipmentSubs){
            this.shipmentSubs.unsubscribe();
        }
        if(this.sendingSubs) {
            this.sendingSubs.unsubscribe();
        }
        this.sending = null;
        this.shipment = null;
    }

    goToTab(tab: string) {
        this.shipmenttab = tab;
    }

    openActionSh() {
        let actionSh = this.actionShCtrl.create({
            title: 'Notificar ',
            buttons: [
                {
                    text: 'Interrumpir servicio',
                    icon: 'close',
                    handler: () => {
                        this.showAlertNotifyAction('cancel');
                    }
                }
            ]
        });
        actionSh.present();
    }

    private filterAndConvertNotificationsToArray() {
        this.notifications = [];
        let notifis = this.sending._notifications;
        let stageStatus:string;
        for(let key in notifis) {
            //console.log(key, notifis[key]);
            stageStatus = notifis[key].currentStage_Status;
            if(NOTIFICATIONS_LIST[stageStatus]===true) {
                //console.log('show notifis > ', stageStatus);
                let item = {
                    key: key,
                    data: notifis[key]
                };
                this.notifications.push(item);
            }
        }
        //console.log(this.notifications);
    }

    private showAlertNotifyAction(action:string) {
        let content = {
            set: false,
            title: '',
            message: '',
        }
        switch(action) {
            case 'pickupDone':
                    content.set = true;
                    content.title = 'Retirado';
                    content.message = 'Confirmo que he retirado el servicio';        
                break;
            case 'dropDone':
                    content.set = true;
                    content.title = 'Entregado';
                    content.message = 'Confirmo que he entregado el servicio';                
                break;
            case 'cancel':
                    content.set = true;
                    content.title = 'Servicio interrumpido';
                    content.message = 'Confirmo que interrumpo la continuidad del servicio, dejando el mismo inconcluso.';                
                break;                
        }
        if(content.set) {
            let alert = this.alertCtrl.create({
                title: content.title,
                message: content.message,
                buttons: [
                    {
                        text: 'Cancelar',
                        role: 'cancel',
                        handler: () => {
                        console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Confirmo',
                        handler: () => {
                            this.runNotifyAction(action);
                        }
                    }
                ]
            });
            alert.present();
        }else{
            console.error('AlertController action param invalid');
        }

    }

    private runNotifyAction(action:string):void {      
        switch(action) {

            case 'pickupDone':
                this.sendingSrv.setPickedup(this.sending.sendingId)
                    .then((result) => {
                        console.log('runNotifyAction > success', result);
                    })
                    .catch((error) => {
                        console.error('runNotifyAction > failed', error);
                    });
                break;

            case 'dropDone':
                this.sendingSrv.setDropped(this.sending.sendingId)
                    .then((result) => {
                        console.log('runNotifyAction > success', result);
                    })
                    .catch((error) => {
                        console.error('runNotifyAction > failed', error);
                    });
                break;

            case 'cancel':
                //this.sendingSrv.updateLiveStatusToCanceled(this.shipment.shipmentId, this.sending.sendingId);    
                break;
        }

    }

}
