import { SHIPMENT_CFG } from '../../models/shipment-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';

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
        public actionShCtrl: ActionSheetController) {
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
            title: 'Confirmar Avances',
            buttons: [
                {
                    text: 'Retirado',
                    icon: 'home',
                    handler: () => {
                        console.log('informar retiro');
                    }
                },
                {
                    text: 'Entregado',
                    icon: 'pin',
                    handler: () => {
                        console.log('informar entrega');
                    }
                },
                {
                    text: 'Otro',
                    icon: 'sad',
                    handler: () => {
                        console.log('otro');
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

}
