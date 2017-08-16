import { Subscription } from 'rxjs/Rx';
import { SendingService } from '../../providers/sending-service/sending-service';
import { LoadingController } from 'ionic-angular';
import { SendingRequest } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { ViewController, NavController, NavParams, Platform, AlertController, ActionSheetController } from 'ionic-angular';

import { CheckoutPage } from '../checkout/checkout';

@Component({
    selector: 'page-sending-detail',
    templateUrl: 'sending-detail.html',
})
export class SendingDetailPage implements OnInit {

    sendingtab:string = "notifications";
    sendingId:string;
    sending:SendingRequest;
    sendingSubs:Subscription;
    notifications:Array<any>;
    private _platform: Platform;
    private _isAndroid: boolean;
    private _isiOS: boolean;
    private _isCore: boolean;

    constructor(public platform: Platform,
        public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public actionShCtrl: ActionSheetController,
        public viewCtrl: ViewController,
        public loadingCtrl: LoadingController,
        public sendingsSrv: SendingService) {
        this._platform = platform;
        this._isAndroid = platform.is('android');
        this._isiOS = platform.is('ios');
        this._isCore = platform.is('core');           
    }

    ngOnInit() {
        console.log('_onInit');
        this.getParams();                      
    }

    ionViewWillEnter() {
        console.log('_willEnter');
        let loader = this.loadingCtrl.create({ content: "Cargando ..." });
        loader.present();  
        let obs = this.sendingsSrv.getByIdObs(this.sendingId, true);
        this.sendingSubs = obs.subscribe((snap) => {
                                this.sending = snap.val();
                                this.setNotificationsAsArray();
                                loader.dismiss();                                
                            }, err => {
                                console.log('err', err);
                            });
    }

    ionViewWillLeave() {
        console.log('_willLeave');
        if(this.sendingSubs) {
            this.sendingSubs.unsubscribe();
        }
    }

    private getParams() {
        console.info('__PRM__  getParams');
        this.sendingId = this.navParams.get('sendingId');
        console.log('__PRM__', this.sendingId);
    }

    private setNotificationsAsArray() {
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
        this.navCtrl.push(CheckoutPage, { sending: this.sending });
    }

    openActionSh() {
        let actionSh = this.actionShCtrl.create({
            title: 'Acciones ',
            buttons: [
                {
                    text: 'Cancelar servicio',
                    icon: 'close',
                    handler: () => {
                        actionSh.dismiss()
                            .then(() => {
                                this.showAlertNotifyAction('cancel_service');
                            });
                            return false;
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
            case 'cancel_service':
                    content.set = true;
                    content.title = 'Seguro deseas cancelar el Servicio?';
                    content.message = 'El servicio será cancelado y ya no estará disponible';                
                break;                
        }
        if(content.set) {
            let alert = this.alertCtrl.create({
                title: content.title,
                message: content.message,
                buttons: [
                    {
                        text: 'No',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Sí, cancelarlo',
                        handler: () => {
                            console.log('confirmed');
                            this.runSendingCancelation();
                        }
                    }
                ]
            });
            alert.present();
        }else{
            console.error('AlertController action param invalid');
        }

    }


    private runSendingCancelation() {
        let loading = this.loadingCtrl.create({ content: 'cancelando ...'});
        this.sendingsSrv.setCanceledbysender(this.sendingId)
            .then(() => {
                console.log('sending canceled ok');
                let alert = this.alertCtrl.create({
                    title: 'Servicio Cancelado',
                    subTitle: 'La cancelación del servicio se ha iniciado correctamente.',
                    buttons: ['Cerrar']
                });
                loading.dismiss()
                    .then(() => {
                        alert.present();
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => {
                console.log('sending canceled error', err.error);
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Ocurrió un error, no se pudo iniciar la cancelación del servicio, vuelve a intentarlo.',
                    buttons: ['Cerrar']
                });
                loading.dismiss()
                    .then(() => {
                        alert.present();
                    })
                    .catch(err => console.log(err));
            });
    }
}
