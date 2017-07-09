import { StartPage } from '../start/start';
import { UserAccount, UserAccountSettings, UserProfileData, UserProfileVerifications } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController, ViewController, AlertController } from 'ionic-angular';
import { UsersService } from '../../providers/users-service/users-service';
import { SettingsPopoverPage } from '../settings-popover/settings-popover';
import { FirebaseObjectObservable } from 'angularfire2/database';
import { Camera } from '@ionic-native/camera';

import firebase from 'firebase';

const STRG_USER_FILES = 'userFiles/';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit{

    fbuser: firebase.User;
    accountObs: FirebaseObjectObservable<any>;
    account: any;
    accountSub: any;
    accountData: UserProfileData;
    accountVerifications: UserProfileVerifications;
    accountStatus: any;
    accountOperator: any;
    accountSettings: UserAccountSettings;
    profileBgDefault: string = 'assets/img/mooven_avatar.png';

    settings = {
        localPush: false,
        email: false,
    }

    constructor(public navCtrl: NavController,
        public userSrv: UsersService,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public popoverCtrl: PopoverController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public cameraPlugin: Camera) {
    }

    ngOnInit() {
        console.log('ngOnInit');
        this.setAccount();
    }

    ionViewWillUnload() {
        console.log('unloading ...');
        this.resetData();
    }


    presentPopover(myEvent):void {
        this.openPopover(myEvent);
    }

    reverifyEmail() {
        this.confirmReverifyEmail();
    }

    updateNotifications() {
        // this.updateNotificationSettings();
    }

    signOut() {
        this.userSignout();
    }

    updatePicture() {
        this.takePictureAndUpdate();
    }

    /**
     * ----------------
     * PRIVATE METHODS
     * ----------------
     */

    private resetData() {
        this.accountObs = null;
        this.accountSub.unsubscribe();
        this.account = null;
        this.accountData = null;
        this.accountOperator = null;
        this.accountStatus = null;
        this.accountVerifications = null;
        this.accountSettings = null;
    }

    private confirmReverifyEmail() {
        let alert = this.alertCtrl.create({
            title: 'Validar Email',
            message: 'Si aun no has recibido un correo electrónico con un link para validar tu dirección de email, prueba reenviarlo.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        //console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Reenviar',
                    handler: () => {
                        this.resendEmailVerification();
                    }
                }
            ]
        });
        alert.present();        
    }

    private resendEmailVerification() {
        this.userSrv.resendEmailVerification()
            .then((result) => {
                console.log('resend', result);
            })
            .catch((error) => {
                console.error('resend', error);
            });
    }

    private userSignout() {
        // loader effect
        let loader = this.loadingCtrl.create({
            content: 'Cerrando sesión ...',
        });
        loader.present();
        setTimeout(() => {
            this.userSrv.signOut();
            this.navCtrl.setRoot(StartPage);
        }, 1000);

        setTimeout(() => {
            loader.dismiss();
        }, 3000); 
    }

    private openPopover(myEvent:any):void {
        let popover = this.popoverCtrl.create(SettingsPopoverPage, { 
            accountData: this.accountData
        });
        popover.present({
            ev: myEvent
        });
        popover.onDidDismiss((data) => {
            // check on popover>dismiss, if account update is required
            if(data) {
                console.log('popover closed > update ? ', data);
            }
        });    
    }



    private setAccount() {
        // loader
        let loading = this.loadingCtrl.create({
            content: 'Cargando perfil ...'
        });
        loading.present();
        // get
        this.accountObs = this.userSrv.getAccountObs();
        this.accountSub = this.accountObs.subscribe(snap => {
            loading.dismiss();
            this.account = snap.val();
            this.accountData = snap.val().profile.data;
            this.accountOperator = snap.val().operator;
            this.accountVerifications = snap.val().profile.verifications;
            this.accountStatus = snap.val().profile.status;
            this.accountSettings = snap.val().settings;
            this.setSettings();
        }, (error) => {
            console.log(error);
            loading.dismiss();
        });         
    }   

    private setSettings() {
        this.settings.email = this.accountSettings.notifications.email;
        this.settings.localPush = this.accountSettings.notifications.localPush;
    }

    private updateSettings() {
        this.userSrv.updateAccountSettingsNotifications(this.settings)
            .then(() => {
                console.log('updateSettings > success');
            })
            .catch((error) => console.log('error', error));  
    }

    // private setAccountData(){
    //     let steps = {
    //         reload: false,
    //         account: false
    //     }
    //     let account: UserAccount;
    //     //console.group('settings.setAccount');
    //     // show loader
    //     let loader = this.loadingCtrl.create({
    //         content: "Actualizando datos ...",
    //     });
    //     loader.present();
    //     // run      
    //     this.userSrv.reloadUser()
    //         .then(() => {
    //             steps.reload = true;
    //             this.fbuser = this.userSrv.getUser();
    //             //console.log('fb user reloaded (email related) > ', this.fbuser.email, this.fbuser.emailVerified);
    //             if(this.fbuser){     
    //                 return this.userSrv.getAccount();
    //             }
    //         })
    //         .then((snapshot) => {
    //             steps.account = true;
    //             //console.info('setAccountData > success');
    //             account = snapshot.val();              
    //             // profile data
    //             this.accountData = account.profile.data;
    //             // profile verifications
    //             this.accountVerifications = account.profile.verifications;
    //             // account settings
    //             this.checkAccountSettings(account);
    //             // account status
    //             this.accountStatus = this.userSrv.accountProfilesStatus(account);     
    //             if(this.accountVerifications.email.verified===false) {
    //                 //console.info('settings.setAccount > run email verification');
    //                 this.userSrv.runAuthEmailVerification();
    //             }  
    //             loader.dismiss();         
    //         })
    //         .catch((error) => {
    //             //console.log('setAccountData > error ', error, steps);
    //             loader.dismiss();
    //         });            

    // }

    // private checkAccountSettings(account: UserAccount):void {
    //     console.info('check user settings');
    //     if(this.userSrv.checkAccountSettingsConsistency(account)) {
    //         console.log('checkAccountSettingsConsistency > true');
    //     }else{
    //         this.userSrv.initAccountSettingsMissingParams(account)
    //             .then(() => {
    //                 this.setAccountData();
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });            
    //     }
    // }



    /**
     *  IMAGE HELPERS
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

    private takePictureAndUpdate() {
        console.info('settings > updatePicture');
        let steps = {
            get: false,
            upload: false,
            update: false
        }
        this.cameraPlugin.getPicture({
            quality: 95,
            destinationType: this.cameraPlugin.DestinationType.DATA_URL,
            sourceType: this.cameraPlugin.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: this.cameraPlugin.EncodingType.JPEG,
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
            return this.userSrv.updateAccountImage(downloadURL, fullPath);
        })        
        .then((result) => {
            steps.update = true;
            console.log('updatePicture > updateAccountImage > success', steps);
            let toast = this.toastCtrl.create({
                message: 'Tu foto de perfil fue actualizada!',
                duration: 1500,
                position: 'top'
            });
            toast.present();
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

}
