import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, ModalController } from 'ionic-angular';
import { StartPage } from '../start/start';
import { UsersService } from '../../providers/users-service/users-service';

import { ModalUserEditEmailPage } from '../modal-user-edit-email/modal-user-edit-email';
import { ModalUserEditPhonePage } from '../modal-user-edit-phone/modal-user-edit-phone';
import { ModalUserEditNamePage } from '../modal-user-edit-name/modal-user-edit-name';

@Component({
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit{

    user: any;
    profile: any;
    account: any;
    input = {
        firstName: '',
        lastName: '',
        email: '',
        phoneMobile: ''
    }
    inputDisabled = {
        names: true,
        email: true,
        phoneMobile: true
    }

    constructor(public navCtrl: NavController,
        public users: UsersService,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController) {
    }

    ngOnInit() {
        this.setUser();
        this.initInputs();
    }

    presentModalEditEmail() {
        // show modal
        let modal = this.modalCtrl.create(ModalUserEditEmailPage);
        modal.present();
    }

    presentModalEditPhone() {
        let modal = this.modalCtrl.create(ModalUserEditPhonePage);
        modal.present();
    }

    presentModalEditName() {
        let modal = this.modalCtrl.create(ModalUserEditNamePage);
        modal.present();
    }

    signOut() {
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'Cerrando sesión ...',
            dismissOnPageChange: true
        });
        loader.present();

        this.users.signOut();
    }

    /**
     *  PRIVATE METHODS
     */

    private setUser(){
        this.user = this.users.getCurrentUser();
        // set profile
        this.users.getCurrentUserProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
        });
        this.users.getCurrentUserAccount()
            .then((snapshot)  => {
                this.account = snapshot.val();
        });
    }

    private initInputs() {
        this.input.email = this.user.email;
    }


}
