import { StartPage } from '../start/start';
import { UserAccount, UserAccountSettings, UserProfileData, UserProfileVerifications } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController, ViewController, AlertController } from 'ionic-angular';
import { UsersService } from '../../providers/users-service/users-service';
import { SettingsPopoverPage } from '../settings-popover/settings-popover';
import { Camera } from 'ionic-native';

import firebase from 'firebase';

const STRG_USER_FILES = 'userFiles/';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit{

    fbuser: firebase.User;
    profData: UserProfileData;
    profVrfs: UserProfileVerifications;
    accountStatus: any;
    profileBgDefault: string = 'assets/img/mooven_avatar.png';
    accountSettings: UserAccountSettings;
    accountSettingsDisabled:boolean;
    notificationSettings = {
        localPush: false,
        email: false
    }

    constructor(public navCtrl: NavController,
        public users: UsersService,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public popoverCtrl: PopoverController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController) {
    }

    ngOnInit() {
        this.accountSettingsDisabled = true;
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

    /**
     *  SETTINGS
     */

    updateNotificationSettings(e) {
        this.users.updateAccountSettingsNotifications(this.notificationSettings)
            .then(() => {
                console.log('updateAccountSettingsNotifications > success');
            })
            .catch((error) => console.log('error', error));  
    }

    /**
     * Take picture and save imageData
     */
    updatePicture() {
        console.info('settings > updatePicture');
        let steps = {
            get: false,
            upload: false,
            update: false
        }
        Camera.getPicture({
            quality: 95,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 900,
            targetHeight: 900,
            saveToPhotoAlbum: true,
            correctOrientation: true
        })
        .then((imageData) => {
            console.log('updatePicture > getPicture > success');
            steps.get = true;
            let base64Image: string;
            base64Image = "data:image/jpeg;base64," + imageData;
            return this.uploadProfileImage(base64Image);
        })
        .then((snapshot) => {
            console.log('updatePicture > uploadProfileImage > success');
            steps.upload = true;
            let downloadURL = snapshot.downloadURL;
            let fullPath = snapshot.ref.fullPath;
            return this.users.updateAccountImage(downloadURL, fullPath);
        })        
        .then((result) => {
            steps.update = true;
            console.log('updatePicture > updateAccountImage > success', steps);
            let toast = this.toastCtrl.create({
                message: 'Tu foto de perfil fue actualizada!',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            toast.dismiss()
                .then(() => {
                    this.setAccountData();
                })
                .catch((error) => console.log('error', error));  
        })
        .catch((error) => {
            console.log('updatePicture > error > ' + error, steps);
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Ocurrió un error, por favor vuelve a intentarlo',
                buttons: ['Cerrar']
            });
            alert.present();
        });
    }

    signOut() {
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'Cerrando sesión ...',
        });
        loader.present();
        setTimeout(() => {
            this.users.signOut();
            this.navCtrl.setRoot(StartPage);
        }, 1000);

        setTimeout(() => {
            loader.dismiss();
        }, 3000);        
    }

    /**
     *  PRIVATE METHODS
     */

    private uploadProfileImage(imageData: string): Promise<any> {
        console.group('uploadProfileImage');
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.fbuser.uid)
                    .child('profileImage.jpg')
                    .putString(imageData, firebase.storage.StringFormat.DATA_URL, {contentType: 'image/jpeg'});
            uploadTask.on('state_changed', function(snapshot) {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.info('Upload is ' + progress + '% done');
            }, function (error:any) {
                // error
                console.log('failed > ', error.code);
                reject(error);
                console.groupEnd();
            }, function() {
                // success
                resolve(uploadTask.snapshot);
                console.log('uploadProfileImage > success');
                console.groupEnd();                
            });
        });
    }

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
                // profile data
                this.profData = account.profile.data;
                // profile verifications
                this.profVrfs = account.profile.verifications;
                // account settings
                this.checkAccountSettings(account);
                // account status
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

    private checkAccountSettings(account: UserAccount):void {
        console.info('check user settings');
        if(this.users.checkAccountSettingsConsistency(account)) {
            console.log('checkAccountSettingsConsistency > true');
            this.enableAccountSetting(account.settings);
        }else{
            this.users.initAccountSettingsMissingParams(account)
                .then(() => {
                    this.setAccountData();
                })
                .catch((error) => {
                    console.log(error);
                });            
        }
    }

    private enableAccountSetting(settings:any) {
        // set
        this.accountSettings = settings;
        // copy
        this.notificationSettings = this.accountSettings.notifications;
        // enable
        this.accountSettingsDisabled = false;
    }
}
