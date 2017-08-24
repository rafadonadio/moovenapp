import { AuthService } from '../../providers/auth-service/auth-service';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController  } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html'
})
export class SignupPage implements OnInit {

    form: FormGroup;
    showErrors:boolean;
    loader:any;

    constructor(public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public authSrv: AuthService) {
    }

    ngOnInit() {
        this.showErrors =  false;
        this.form = this.formBuilder.group({
            'email':  ['', [Validators.required, EmailValidator.isValid]],
            'password': ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    /**
     * Signup Form Submit
     */
    submit():void {
        console.info('__SUB__ submit()');
        console.log('__SUB__ form.valid',this.form.valid)
        if(!this.form.valid) {
            this.showErrors = true;
            let alertError = this.alertCtrl.create({
                title: 'Campos incompletos',
                subTitle: 'Por favor ingresa tu correo y crea una contraseña',
                buttons: [{
                    text: 'Cerrar',
                    role: 'cancel'
                }]
            });
            alertError.present();            
        }else{
            this.createUser();
        }
    }

    /**
     *  HELPERS
     */

    /**
     *  CREATE NEW USER
     *  1- create firebase user with email and password
     *  2- create account in database, with user id and email
     *  3- send email verification
     */
    private createUser(): void {
        console.info('_createUser_');           
        // loader effect
        this.loader = this.loadingCtrl.create({
            content: 'Registrando tu cuenta ...'
        });
        this.loader.present();   
        // form
        let email = this.form.get('email').value;
        let password = this.form.get('password').value;           
        this.authSrv.createUserWithEmailAndPassword(email, password)
            .then((fbuser) => {
                console.log('create user success', fbuser.uid);
                // CLOUD FUNCTIONS TRIGGER
                console.log('CF_Trigger:createUserAccount|user().onCreate()');
                this.loader.dismiss();
            })
            .catch((error:any) => {
                console.error('create user error', error);
                this.loader.dismiss()
                    .then(() => {
                        this.presentErrorAlert(error);
                    });
        });
    }

    private presentErrorAlert(error:any):void {
        // set strings
        var msg: string;
        var context: string;
        switch(error.code){
            case 'auth/email-already-in-use':
                context = 'Dirección en uso';
                msg = 'La dirección de correo ya esta en uso, vuelve a intentarlo';
                break;
            case 'auth/invalid-email':
                context = 'Dirección inválido';
                msg = 'La dirección de email es inválida, vuelve a intentarlo por favor';
                break;
            case 'auth/operation-not-allowed':
                context = 'Error';
                msg = 'Esta acción no esta permitida';
                break;
            case 'auth/weak-password':
                context = 'Contraseña débil';
                msg = 'La contraseña creada es muy débil';
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
