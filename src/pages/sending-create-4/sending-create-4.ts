import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';

import { SendingService } from  '../../providers/sending-service/sending-service';

import { SendingsPage } from '../sendings/sendings';
import { SendingCreatePage } from '../sending-create/sending-create';

@Component({
    templateUrl: 'sending-create-4.html',
})
export class SendingCreate4Page implements OnInit {

    request: any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        public sendings: SendingService) {
    }

    ngOnInit() {
        this.getRequestFromParams();
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
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Confirmar y Pagar',
                    handler: () => {
                        console.log('confirmed');
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
            console.log('Dismissed toast');
        });

        toast.present();
    }

    goToStep1() {
        this.navCtrl.push(SendingCreatePage);
    }

    goToStep2() {
        this.navCtrl.remove(3, 2);
    }

    goToStep3() {
        this.navCtrl.pop();
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
        this.sendings.create(this.request)
            .then(() => {
                console.log('sending created > ok');
                loader.dismiss()
                    .then(() => {
                        this.navCtrl.setRoot(SendingsPage);
                        this.presentToast();
                    });
            })
            .catch((error) => {
                console.log('sending created > error', error.code);
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

    private getRequestFromParams() {
        this.request = this.navParams.get('request');
    }

}
