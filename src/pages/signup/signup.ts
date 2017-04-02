import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController  } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserCredentials } from '../../models/user-model';
import { UsersService } from '../../providers/users-service/users-service';
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
        public usersSrv: UsersService,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController) {
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
            let email = this.form.get('email').value;
            let password = this.form.get('password').value;
            this.setLoader();
            this.createUser({ email: email, password: password });
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
    private createUser(newUser: UserCredentials):void {
        console.info('__CUS__createUser()');
        console.info('__1__createUser');
        this.usersSrv.createUser(newUser)
            .then((fbuser:firebase.User) => {
                console.log('__1__', fbuser.uid);
                // create account in DB
                console.info('__2__createAccount');
                return this.usersSrv.createAccountStep1(fbuser)
            })
            .then(() => {
                console.log('__2__ success');
                // send email address verification
                this.usersSrv.sendEmailVerification();
                this.loader.dismiss()
                    .then(() => {
                        // end
                    });
            })
            .catch((error) => {
                console.error('__CUS__', error);
                this.loader.dismiss()
                    .then(() => {
                        this.presentErrorAlert(error.code);
                    });
        });
    }

    private setLoader() {
        // loader effect
        this.loader = this.loadingCtrl.create({
            content: 'Registrando tu cuenta ...'
        });
        this.loader.present();
    }

    private presentErrorAlert(msgCode: string ):void {
        // set strings
        var msg: string;
        var context: string;
        switch(msgCode){
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
