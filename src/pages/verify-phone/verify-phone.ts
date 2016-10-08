import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { SignupMergePage } from '../signup-merge/signup-merge';
import { UpdatePhoneNumberPage } from '../update-phone-number/update-phone-number';
import { SendingsPage } from '../sendings/sendings';
import { ModalUserEditPhonePage } from '../modal-user-edit-phone/modal-user-edit-phone';

@Component({
    templateUrl: 'verify-phone.html',
})
export class VerifyPhonePage {

    constructor(public navCtrl: NavController,
        public alertCtrl:  AlertController,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController) {
        }

        goToUpdatePhoneNumber() {
            let modal = this.modalCtrl.create(ModalUserEditPhonePage);
            modal.present();
        }

        showAlert() {
            let alert = this.alertCtrl.create({
                title: 'Código reenviado',
                subTitle: 'Te reenviamos el mensaje de texto con el código de verificación, por favor aguarda algunos minutos.',
                buttons: ['OK']
            });
            alert.present();
        }

        goToHome() {
            this.navCtrl.setRoot(SendingsPage);
        }

        goToApp() {
            let loading = this.loadingCtrl.create({
                content: 'Creando tu cuenta, aguarda unos segundos ...'
            });

            loading.present();

            setTimeout(() => {
                this.navCtrl.setRoot(SendingsPage);
            }, 2000);

            setTimeout(() => {
                loading.dismiss();
            }, 1000);

        }

        verifyCode() {
            let loading = this.loadingCtrl.create({
                content: 'Verificando tu numero y creando tu cuenta, aguarda unos segundos ...'
            });

            loading.present();

            setTimeout(() => {
                this.navCtrl.setRoot(SendingsPage);
            }, 3000);

            setTimeout(() => {
                loading.dismiss();
            }, 3000);

        }

    }
