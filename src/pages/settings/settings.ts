import { UserAccount, UserProfileData, UserProfileVerifications } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController } from 'ionic-angular';
import { UsersService } from '../../providers/users-service/users-service';

import { SettingsPopoverPage } from '../settings-popover/settings-popover';


@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit{

    fbuser: firebase.User;
    profData: UserProfileData;
    profVrfs: UserProfileVerifications;
    accountStatus: any;
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
        this.setAccountData();
        this.initInputs();
    }

    doRefresh(refresher) {
        console.log('Begin async operation', refresher);
        this.setAccountData();
        setTimeout(() => {
            console.log('Async operation has ended');
            refresher.complete();
        }, 2000);
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

    private setAccountData(){
        let account: UserAccount;
        this.fbuser = this.users.getUser();
        if(this.fbuser){     
            this.users.getAccount()
                .then((snapshot) => {
                    //console.log(snapshot.val());
                    account = snapshot.val();              
                    this.profData = account.profile.data;
                    this.profVrfs = account.profile.verifications;
                    this.accountStatus = this.users.accountProfilesStatus(account);
                });
        }
    }

    private initInputs() {
        this.input.email = this.fbuser.email;
    }


}
