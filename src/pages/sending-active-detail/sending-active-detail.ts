import { Subscription } from 'rxjs/Rx';
import { SendingService } from '../../providers/sending-service/sending-service';
import { Alert, LoadingController } from 'ionic-angular';
import { SendingRequest, SendingTask , CF_TASKS } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { ViewController, NavController, NavParams, Platform, ToastController, AlertController, ActionSheetController } from 'ionic-angular';

import { CheckoutPage } from '../checkout/checkout';

@Component({
    selector: 'page-sending-active-detail',
    templateUrl: 'sending-active-detail.html',
})
export class SendingActiveDetailPage implements OnInit {

    sendingtab:string = "notifications";
    sendingId:string;
    sending:SendingRequest;
    sendingSubs:Subscription;
    notifications:Array<any>;
    tasks:Array<SendingTask>;
    displayTasks:boolean;
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
        public sendingsSrv: SendingService,
        public toastCtrl: ToastController) {
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
        this.displayTasks = false;
        let loader = this.loadingCtrl.create({ content: "Cargando ..." });
        loader.present();  
        let obs = this.sendingsSrv.getByIdObs(this.sendingId, true);
        this.sendingSubs = obs.subscribe((snap) => {
                                this.sending = snap.val();
                                this.setNotificationsAsArray();
                                this.setTasksAsArray();
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

    private setTasksAsArray() {
        this.tasks = [];
        let tasks = this.sending.hasOwnProperty('_tasks') ? this.sending._tasks : [];
        for(let key in tasks) {
            //console.log(key, tasks[key]);
            this.tasks.push(tasks[key]);
        }
        //console.log(this.notifications);
    }    

    toggleDisplayTasks() {
        if(this.displayTasks) {
            this.displayTasks = false;
        }else{
            this.displayTasks = true;
        }
    }

    getTaskTitle(taskslug) {
        return CF_TASKS.hasOwnProperty(taskslug) ? CF_TASKS[taskslug].TITLE : '--';
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
                                this.showAlertNotifyAction('cancelService');
                            })
                            .catch(err => console.log(err));
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
            cancelBtnTxt: '',
            confirmBtnTxt: ''
        }
        switch(action) {
            case 'cancelService':
                    content.set = true;
                    content.title = 'Seguro deseas cancelar el Servicio?';
                    content.message = 'El servicio ser?? cancelado y ya no estar?? disponible';  
                    content.cancelBtnTxt = 'No';
                    content.confirmBtnTxt = 'S??, cancelarlo';
                break;                
        }
        if(!content.set) {
            console.error('AlertController action param invalid');
            return;
        }
        let alert = this.alertCtrl.create({
            title: content.title,
            message: content.message,
            buttons: [
                {
                    text: content.cancelBtnTxt,
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: content.confirmBtnTxt,
                    handler: () => {
                        console.log('confirmed');
                        switch(action) {
                            case 'cancelService':
                                this.runSendingCancelation();           
                            break;
                        }
                    }
                }
            ]
        });
        alert.present();
    }


    private runSendingCancelation() {
        let loading = this.loadingCtrl.create({ content: 'cancelando ...'});
        this.sendingsSrv.setCanceledbysender(this.sendingId)
            .then(() => {
                console.log('sending canceled ok');
                let alert:Alert = this.alertCtrl.create({
                    title: 'Cancelaci??n en proceso',
                    subTitle: 'La cancelaci??n del servicio se ha iniciado correctamente.',
                    buttons: ['Cerrar']
                });
                loading.dismiss()
                    .then(() => {
                        console.log('loading dismissed');
                        alert.present();
                        return alert.onDidDismiss(() => {
                            console.log('alert dismissed');
                            this.navCtrl.pop();
                        });
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => {
                console.log('sending canceled error', err.error);
                let alert = this.alertCtrl.create({
                    title: 'Error',
                    subTitle: 'Ocurri?? un error, no se pudo iniciar la cancelaci??n del servicio, vuelve a intentarlo.',
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
