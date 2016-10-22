import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { SendingService } from  '../../providers/sending-service/sending-service';

import { SendingsPage } from '../sendings/sendings';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingCreate2Page } from '../sending-create-2/sending-create-2';
import { SendingCreate3Page } from '../sending-create-3/sending-create-3';

@Component({
    selector: 'page-sending-create-4',
    templateUrl: 'sending-create-4.html',
})
export class SendingCreate4Page implements OnInit {

    sending: any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public sendings: SendingService) {
    }

    ngOnInit() {
        console.log('f4 > init');
        this.getSendingFromParams();
    }

    confirmSending() {
        let alert = this.alertCtrl.create({
            title: 'Confirmar envío',
            message: 'Se debitarán $79,00 de tu cuenta y tu envío será confirmado',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > submit > confirm > canceled');
                    }
                },
                {
                    text: 'Confirmar y Pagar',
                    handler: () => {
                        console.log('f4 > submit > confirm > process');
                        this.createSending();
                    }
                }
            ]
        });
        alert.present();
    }

    presentToast() {
        let toast = this.toastCtrl.create({
            message: 'Tu envío fue creado!',
            duration: 3000,
            position: 'bottom'
        });

        toast.onDidDismiss(() => {
            console.log('f4 > toast > dismissed');
        });

        toast.present();
    }

    goBack(step:number) {
        console.log('f4 > go to f' + step + ', include this.sending in params');
        let page: any;
        switch(step) {
            case 1: 
                page = SendingCreatePage;
                break;
            case 2: 
                page = SendingCreate2Page;
                break;
            case 3: 
                page = SendingCreate3Page;
                break;                                
        }
        this.navCtrl.push(page, {
            sending: this.sending
        });
    }

    cancelSending() {
        let alert = this.alertCtrl.create({
            title: '¿Cancelar Envío?',
            message: 'Se perderán todos los datos ingresados del Nuevo Envío.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        console.log('f4 > cancel form > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     *  PRIVATE
     */

    private createSending() {
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'creando ...'
        });
        loader.present();
        // save to db
        this.sendings.create(this.sending)
            .then(() => {
                console.log('f4 > create sending > success');
                loader.dismiss()
                    .then(() => {
                        this.navCtrl.setRoot(SendingsPage);
                        this.presentToast();
                    });
            })
            .catch((error) => {
                console.log('f4 > create sending > error', error.code);
                loader.dismiss()
                    .then(() => {
                        let alertError = this.alertCtrl.create({
                            title: 'Ocurrió un error',
                            subTitle: 'Ocurrió un error al intentar guardar el envío, por favor intenta nuevamente.',
                            buttons: [{
                                text: 'Cerrar',
                                role: 'cancel'
                            }]
                        });
                        // show
                        alertError.present();
                    });
            });
    }

    private getSendingFromParams() {
        console.log('f4 > get navParams > this.sending');
        console.log('f4 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
    }

}
