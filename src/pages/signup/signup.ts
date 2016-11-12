import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController  } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UserCredentials } from '../../models/user-model';
import { UsersService } from '../../providers/users-service/users-service';
import { EmailValidator } from '../../validators/email.validator';

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html'
})
export class SignupPage implements OnInit {

    signupForm: FormGroup;
    email: AbstractControl;
    password: AbstractControl;

    constructor(public navCtrl: NavController,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController) {
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
        console.info('signup > submitSignupForm > ', value);
        if(this.signupForm.valid!==true) {
            // something went wrong, errors on view
            console.error('signup > signupform.valid==false')
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
                    console.log('submitSignupForm > createUserWithEmailAndPassword > success > uid ', user.uid);
                    // create account in DB
                    this.users.createAccountFromCurrentUser(user)
                        .then(() => {
                            console.log('submitSignupForm > createUserWithEmailAndPassword > createAccountFromCurrentUser > success');
                            // send email address verification
                            this.users.sendEmailVerification();
                    });
            })
            .catch((error) => {
                console.error('createUserWithEmailAndPassword > error > ', error);
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
