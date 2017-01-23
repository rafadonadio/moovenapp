import { SendingService } from '../../providers/sending-service/sending-service';
import { SENDING_CFG, SendingRequest } from '../../models/sending-model';
import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';

const CFG = SENDING_CFG;
const NOTIFICATIONS_LIST = SHIPMENT_CFG.NOTIFICATIONS_TO_SHOW;

@Component({
    selector: 'page-shipment-detail',  
    templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage implements OnInit{

    shipmenttab: string = "notifications";
    sending:SendingRequest;
    shipment:any;
    sender:any;
    notifications:Array<any>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public actionShCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public sendingSrv: SendingService) {
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        this.shipment = this.navParams.get('shipment');
        this.sender = this.navParams.get('sender');
        this.filterAndConvertNotificationsToArray();  
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
        if(action=='pickupDone') {
            this.sendingSrv.updateLiveStatusToPickedup(this.shipment.shipmentId, this.sending.sendingId)
                .then((result) => {
                    console.log('runNotifyAction > success', result);
                })
                .catch((error) => {
                    console.error('runNotifyAction > failed', error);
                });
        }else if(action=='dropDone') {
            //this.sendingSrv.updateLiveStatusToDropped(this.shipment.shipmentId, this.sending.sendingId);    
        }else if(action=='cancel') {
            //this.sendingSrv.updateLiveStatusToCanceled(this.shipment.shipmentId, this.sending.sendingId);    
        } 
    }

}
