import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';

const NOTIFICATIONS_LIST = SHIPMENT_CFG.NOTIFICATIONS_TO_SHOW;

@Component({
    selector: 'page-shipment-detail',  
    templateUrl: 'shipment-detail.html',
})
export class ShipmentDetailPage implements OnInit{

    shipmenttab: string = "notifications";
    sending:any;
    shipment:any;
    notifications:Array<any>;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public actionShCtrl: ActionSheetController,
        public alertCtrl: AlertController) {
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        this.shipment = this.navParams.get('shipment');
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
                        console.log('Buy clicked');
                        }
                    }
                ]
            });
            alert.present();
        }else{
            console.error('AlertController action param invalid');
        }

    }

}
