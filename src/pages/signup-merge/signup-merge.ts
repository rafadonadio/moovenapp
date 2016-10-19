import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';

import { VerifyPhonePage } from '../verify-phone/verify-phone';
import { ModalTosPage } from '../modal-tos/modal-tos';

@Component({
    selector: 'page-signup-merge',
    templateUrl: 'signup-merge.html'
})
export class SignupMergePage implements OnInit{

    signupMergeForm: FormGroup;
    firstName: AbstractControl;
    lastName: AbstractControl;
    phonePrefix: AbstractControl;
    phoneMobile: AbstractControl;
    confirmTos: AbstractControl;

    currentUser: any;

    constructor(public navCtrl: NavController,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController) {
    }

    ngOnInit() {
        this.setCurrentUser();
        this.signupMergeForm = this.formBuilder.group({
            'firstName': ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'lastName': ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'phonePrefix': ['+549', Validators.compose([Validators.required])],
            'phoneMobile': ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(25)])]
        });
        this.firstName = this.signupMergeForm.controls['firstName'];
        this.lastName = this.signupMergeForm.controls['lastName'];
        this.phonePrefix = this.signupMergeForm.controls['phonePrefix'];
        this.phoneMobile = this.signupMergeForm.controls['phoneMobile'];
    }


    submitSignupMergeForm(value: any): void {
        // verify inputs are valid
        if(this.signupMergeForm.valid!==true) {
            // something is not good
            console.log('signupMergeForm = false');
        }else{

            // loader effect
            let loader = this.loadingCtrl.create({
                content: 'Guardando ...',
                dismissOnPageChange: true
            });
            loader.present();

            // init profile
            let profile = {
                firstName: value.firstName,
                lastName: value.lastName,
                phonePrefix: value.phonePrefix,
                phoneMobile: value.phoneMobile
            };

            this.users.updateUserProfile(profile)
                .then((result) => {
                    // update profileComplete status
                    this.users.checkUserProfileCompleteStatus();
                    // update firebase user displayName
                    var displayName = profile.firstName + ' ' + profile.lastName;
                    this.users.updateCurrentUserDisplayName(displayName);
                })
                .then((result) => {
                    console.log('user profile updated');
                    // all good, go to confirm mobile phone
                    this.navCtrl.push(VerifyPhonePage);
                })
                .catch((error) => {
                    console.log('updateUserProfile error > ', error);
                    loader.dismiss()
                        .then(() => {
                            let alert = this.alertCtrl.create({
                                title: 'Atención',
                                subTitle: 'Ocurrió un error, por favor vuelve a intentar',
                                buttons: [
                                    {
                                        text: 'Cerrar',
                                        role: 'cancel'
                                    }
                                ]
                            });
                            alert.present();
                        });
                });
        }
    }

    presentModalTos() {
        // show modal
        let modal = this.modalCtrl.create(ModalTosPage);
        modal.present();
    }

    signOut() {
        let alert = this.alertCtrl.create({
            title: 'Salir',
            subTitle: 'Si cierras la sesión, puedes completar tu registración la próxima vez que inicies sesión',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Cerrar sesión',
                    handler: () => {
                        this.users.signOut();
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     * PRIVATE
     */

     private setCurrentUser() {
         this.currentUser = this.users.getCurrentUser();
     }

}
