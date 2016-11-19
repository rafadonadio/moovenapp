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
        let steps = {
            reload: false,
            account: false
        }
        let account: UserAccount;
        console.group('settings.setAccount');
        // show loader
        let loader = this.loadingCtrl.create({
            content: "Actualizando datos ...",
        });
        loader.present();
        // run      
        this.users.reloadUser()
            .then(() => {
                steps.reload = true;
                this.fbuser = this.users.getUser();
                console.log('fb user reloaded (email related) > ', this.fbuser.email, this.fbuser.emailVerified);
                if(this.fbuser){     
                    return this.users.getAccount();
                }
            })
            .then((snapshot) => {
                steps.account = true;
                console.info('setAccountData > success');
                account = snapshot.val();              
                this.profData = account.profile.data;
                this.profVrfs = account.profile.verifications;
                this.accountStatus = this.users.accountProfilesStatus(account);     
                if(this.profVrfs.email.verified===false) {
                    console.info('settings.setAccount > run email verification');
                    this.users.runAuthEmailVerification();
                }  
                console.groupEnd();
                loader.dismiss();         
            })
            .catch((error) => {
                console.log('setAccountData > error ', error, steps);
                console.groupEnd();
                loader.dismiss();
            });            

    }
}
