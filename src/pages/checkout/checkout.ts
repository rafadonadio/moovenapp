import { AlertController } from 'ionic-angular/components/alert/alert';
import { ToastController } from 'ionic-angular/components/toast/toast';
import { LoadingController } from 'ionic-angular/components/loading/loading';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SendingPaymentService } from '../../providers/sending-service/sending-payment-service';

import { SendingsPage } from '../sendings/sendings';

@Component({
    selector: 'page-checkout',
    templateUrl: 'checkout.html'
})
export class CheckoutPage implements OnInit {

    sending: any;

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        public paySrv: SendingPaymentService,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController) {}

    ngOnInit() {
        // get sending data
        this.sending = this.navParams.get('sending'); 
    }


    private paySending() {
        console.info('paySending > start');
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'procesando pago ...',
        });
        loader.present();
        // pay
        this.paySrv.checkout()
            .then((result) => {
                console.log('payment ok', result);
                loader.dismiss()
                    .then(() => {
                        //this.sendingPayed = true;
                        //this.navCtrl.setRoot(SendingsPage);
                        this.presentToast();
                    });
            })
            .catch((error) => {
                console.log('f4 > payment sending > error', error);
                loader.dismiss()
                    .then(() => {
                        let alertError = this.alertCtrl.create({
                            title: 'Error con el pago',
                            subTitle: 'Ocurrió un error al procesar el pago, por favor intenta nuevamente.',
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

    goToSendings() {
        let alert = this.alertCtrl.create({
            title: 'Volver al listado?',
            message: 'El servicio esta creado y puedes finalizar el pago luego, hasta una hora antes de la hora de retiro.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f4 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si, volver',
                    handler: () => {
                        console.log('f4 > cancel form > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    } 

    private presentToast() {
        let toast = this.toastCtrl.create({
            message: 'El pago fue procesado correctamente',
            duration: 3000,
            position: 'bottom'
        });

        toast.onDidDismiss(() => {
            console.log('f4 > toast > dismissed');
        });

        toast.present();
    }

}
