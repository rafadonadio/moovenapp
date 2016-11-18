import { UserAccount, UserProfileData, UserProfileVerifications } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController, ViewController } from 'ionic-angular';
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

    constructor(public navCtrl: NavController,
        public users: UsersService,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public popoverCtrl: PopoverController,
        public viewCtrl: ViewController ) {
    }

    ngOnInit() {
        this.setAccountData();
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
        let popover = this.popoverCtrl.create(SettingsPopoverPage, { 
            profData: this.profData
        });
        popover.present({
            ev: myEvent
        }); 
        let self = this;
        popover.onDidDismiss(function(data) {
            // check on popover>dismiss, if account update is required
            if(data) {
                console.log('popover closed > update ? ', data);
                if(data.update==true) {
                    self.setAccountData();
                }
            }
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
                    console.info('setAccountData > success');
                    account = snapshot.val();              
                    this.profData = account.profile.data;
                    this.profVrfs = account.profile.verifications;
                    this.accountStatus = this.users.accountProfilesStatus(account);
                })
                .catch((error) => {
                    console.log('setAccountData > error ', error);
                });
        }
    }
}
