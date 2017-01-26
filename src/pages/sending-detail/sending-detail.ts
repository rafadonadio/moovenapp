import { SendingRequest } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, ActionSheetController } from 'ionic-angular';

import { SendingDetailCheckoutPage } from '../sending-detail-checkout/sending-detail-checkout';

@Component({
    selector: 'page-sending-detail',
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage implements OnInit {

    sendingtab:string = "notifications";
    sending:SendingRequest;
    notifications:Array<any>;
    private _platform: Platform;
    private _isAndroid: boolean;
    private _isiOS: boolean;
    private _isCore: boolean;

    constructor(public platform: Platform,
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public actionShCtrl: ActionSheetController) {
        this._platform = platform;
        this._isAndroid = platform.is('android');
        this._isiOS = platform.is('ios');
        this._isCore = platform.is('core');           
    }

    ngOnInit() {
        this.sending = this.navParams.get('sending');
        console.info('navParams > ', this.sending);
        this.convertNotificationsToArray();        
    }

    private convertNotificationsToArray() {
        this.notifications = [];
        let notifis = this.sending._notifications;
        for(let key in notifis) {
            //console.log(key, notifis[key]);
            let item = {
                key: key,
                data: notifis[key]
            };
            this.notifications.push(item);
        }
        //console.log(this.notifications);
    }

    goToCheckout() {
        console.log('go to checkout > ');
        this.navCtrl.push(SendingDetailCheckoutPage, { sending: this.sending });
    }

    openActionSh() {
        let actionSh = this.actionShCtrl.create({
            title: 'Notificaciones ',
            buttons: [
                {
                    text: 'Cancelar servicio',
                    icon: 'close',
                    handler: () => {
                        this.showAlertNotifyAction('cancel');
                    }
                }
            ]
        });
        actionSh.present();
    }

    private showAlertNotifyAction(action:string) {
        let content = {
            set: false,
            title: '',
            message: '',
        }
        switch(action) {
            case 'cancel':
                    content.set = true;
                    content.title = 'Cancelar Servicio';
                    content.message = 'Confirmo que cancelo el servicio, dejando el mismo inconcluso.';                
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
