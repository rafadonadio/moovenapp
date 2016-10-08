import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController  } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UserCredentials } from '../../shared/interfaces';
import { UsersService } from '../../providers/users-service/users-service';
import { EmailValidator } from '../../shared/validators/email.validator';
import { SignupMergePage } from '../signup-merge/signup-merge';

@Component({
    templateUrl: 'signup.html',
    providers: [UsersService],
    directives: [FORM_DIRECTIVES]
})
export class SignupPage implements OnInit {

    signupForm: FormGroup;
    email: AbstractControl;
    password: AbstractControl;

    constructor(private navCtrl: NavController,
        private users: UsersService,
        private formBuilder: FormBuilder,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController) {
    }

    ngOnInit() {
        this.signupForm = this.formBuilder.group({
            'email':  ['', Validators.compose([Validators.required, EmailValidator.isValid])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });

        this.email = this.signupForm.controls['email'];
        this.password = this.signupForm.controls['password'];
    }

    /**
     * Signup Form Submit
     */
    submitSignupForm(value: any):void {

        // verify inputs are valid
        if(this.signupForm.valid!==true) {
            // something went wrong
            console.log('signupform valid = false')
        }else{

            // loader effect
            let loader = this.loadingCtrl.create({
                content: 'Registrando tu cuenta ...',
                dismissOnPageChange: true
            });
            loader.present();

            // init user
            let newUser: UserCredentials = {
                email: value.email,
                password: value.password
            };

            // create new user
            this.users.createUserWithEmailAndPassword(newUser)
                .then((user) => {
                    console.log('user created - uid', user.uid);
                    // create account in DB
                    this.users.createAccountFromCurrentUser()
                        .then(() => {
                            console.log('cuenta db creada');
                            // verify email address
                            this.users.sendEmailVerification();
                    });
            })
            .catch((error) => {
                loader.dismiss()
                    .then(() => {
                        this.presentErrorAlert(error.code);
                    });
            });

        }
    }

    /**
     *  PRIVATE METHODS
     */

    private goToSignupMerge() {
        this.navCtrl.push(SignupMergePage)
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
