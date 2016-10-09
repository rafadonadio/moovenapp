import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UserCredentials } from '../../shared/interfaces';
import { UsersService } from '../../providers/users-service/users-service';
import { EmailValidator } from '../../validators/email.validator';
import { SendingsPage } from '../sendings/sendings';
import { ModalAuthResetPasswordPage } from '../modal-auth-reset-password/modal-auth-reset-password/';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    signinForm: FormGroup;
    email: AbstractControl;
    password: AbstractControl;

    constructor(private navCtrl: NavController,
        private users: UsersService,
        private formBuilder: FormBuilder,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController) {
    }

    ngOnInit() {
        this.signinForm = this.formBuilder.group({
            'email':  ['', Validators.compose([Validators.required, EmailValidator.isValid])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });

        this.email = this.signinForm.controls['email'];
        this.password = this.signinForm.controls['password'];
    }

    /**
     * Signup Form Submit
     */
    submitSigninForm(value: any):void {
        // verify inputs are valid
        if(this.signinForm.valid!==true) {
            // something went wrong
            console.log('signinform valid = false')
        }else{
            // loader effect
            let loader = this.loadingCtrl.create({
                content: 'Iniciando sesión ...',
                dismissOnPageChange: true
            });
            loader.present();
            // init user
            let userData: UserCredentials = {
                email: value.email,
                password: value.password
            };
            // signin
            this.users.signIn(userData)
                .then((user) => {
                    console.log('sign in ok > ', user.displayName);
                    loader.dismiss();
                })
                .catch((error) => {
                    loader.dismiss()
                        .then(() => {
                            this.presentErrorAlert(error.code);
                        });
                });
        }
    }

    presentModalPasswordReset() {
        let modal = this.modalCtrl.create(ModalAuthResetPasswordPage);
        modal.present();
    }

    /**
     *  PRIVATE METHODS
     */

    private presentErrorAlert(msgCode: string ):void {
        // set strings
        var msg: string;
        var context: string;
        switch(msgCode){
            case 'auth/account-exists-with-different-credential':
                context = 'Atención';
                msg = 'Prueba ingresar con tu cuenta de Google o Facebook.';
                break;
            case 'auth/invalid-credential':
                context = 'Error';
                msg = 'Esta cuenta tiene las credenciales inválidas o vencidas.';
                break;
            case 'auth/operation-not-allowed':
                context = 'Error';
                msg = 'Esta operación no es válida';
                break;
            case 'auth/user-disabled':
                context = 'Cuenta inhabilitada';
                msg = 'Esta cuenta se encuentra inhabilitada';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                context = 'Datos incorrectos';
                msg = 'La combinación de dirección de correo y contraseña no coincide con ninguna cuenta, vuelve a intentarlo';
                break;
            default:
                context = 'Error';
                msg = 'Un error inesperado ha ocurrido, vuelve a intentarlo';
        }
        // create alert
        let alertError = this.alertCtrl.create({
            title: context,
            subTitle: msg,
            buttons: [{
                text: 'Cerrar',
                role: 'cancel'
            }]
        });
        // show
        alertError.present();
    }

}
