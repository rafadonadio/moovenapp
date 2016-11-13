import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController } from 'ionic-angular';
import { UsersService } from '../../providers/users-service/users-service';

import { SettingsPopoverPage } from '../settings-popover/settings-popover';


@Component({
    selector: 'page-settings',
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
        public popoverCtrl: PopoverController ) {
    }

    ngOnInit() {
        this.setUser();
        this.initInputs();
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create(SettingsPopoverPage);
        popover.present({
            ev: myEvent
        });       
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
        this.user = this.users.getUser();
        console.log('testing > af > user > ', this.user);        
        // set profile
        this.users.getCurrentUserProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
        });
        this.users.getUserAccount()
            .then((snapshot)  => {
                this.account = snapshot.val();
        });
    }

    private initInputs() {
        this.input.email = this.user.email;
    }


}
