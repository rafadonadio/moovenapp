import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { StartPage } from '../start/start';
import { UserAccount, UserAccountSettings, UserProfileData, UserProfileVerifications } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, PopoverController, ViewController, AlertController } from 'ionic-angular';
import { SettingsPopoverPage } from '../settings-popover/settings-popover';
import { Camera } from '@ionic-native/camera';
import firebase from 'firebase';

const STRG_USER_FILES = 'userFiles/';

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit{

    fbuser: firebase.User;
    account: UserAccount;
    accountSub: Subscription;
    accountData: UserProfileData;
    accountVerifications: UserProfileVerifications;
    accountStatus: any;
    accountOperator: any;
    accountSettings: UserAccountSettings;
    profileBgDefault: string = 'assets/img/mooven_avatar.png';

    constructor(public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public popoverCtrl: PopoverController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public cameraPlugin: Camera,
        public authSrv: AuthService,
        public accountSrv: AccountService) {
        }

    ngOnInit() {
        console.log('ngOnInit');
        this.setAccount();
        this.fbuser = this.authSrv.fbuser;
    }

    ionViewWillUnload() {
        console.log('unloading ...');
        this.resetData();
    }

    /**
     *  CLICK METHODS
     */

    presentPopover(myEvent):void {
        this.openPopover(myEvent);
    }

    reverifyEmail() {
        this.confirmReverifyEmail();
    }

    updateSettings() {
        this.runUpdateSettings();
    }

    signOut() {
        this.userSignout();
    }

    updatePicture() {
        this.takePictureAndUpdate();
    }

    terminateAccount() {
        this.confirmTerminateAccount();
    }

    /**
     * ----------------
     * PRIVATE METHODS
     * ----------------
     */

    private resetData() {
        this.accountSub.unsubscribe();
        this.account = null;
        this.accountData = null;
        this.accountOperator = null;
        this.accountStatus = null;
        this.accountVerifications = null;
        this.accountSettings = null;
        this.fbuser = null;
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
        this.accountSrv.resendEmailVerification()
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
            this.authSrv.signOut();
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
        let obs = this.accountSrv.getObs(true);
        this.accountSub = obs.subscribe(snap => {
            loading.dismiss();
            this.account = snap.val();
            this.accountData = snap.val().profile.data;
            this.accountOperator = snap.val().operator;
            this.accountVerifications = snap.val().profile.verifications;
            this.accountStatus = snap.val().profile.status;
            this.accountSettings = snap.val().settings;
        }, (error) => {
            console.log(error);
            loading.dismiss();
        });         
    }   

    private runUpdateSettings() {
        console.log('updateSettings', this.accountSettings);
        this.accountSrv.updateSettings(this.accountSettings)
            .then(() => {
                console.log('updateSettings > success');
            })
            .catch((error) => console.log('error', error));  
    }
  
    private confirmTerminateAccount() {
        let alert = this.alertCtrl.create({
            title: 'Confirma que deseas terminar tu cuenta',
            message: 'Estas por iniciar el proceso para cerrar tu cuenta de Mooven, te enviaremos un correo para confirmar el inicio del proceso.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        //console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Cerrar mi Cuenta',
                    handler: () => {
                        this.accountSrv.terminateAccount()
                            .then(() =>  {
                                console.log('terminated success');
                            })
                            .catch(err => console.log(err));
                    }
                }
            ]
        });
        alert.present();        
    }


    /**
     *  IMAGE HELPERS
     */

    private uploadProfileImage(imageData: string): Promise<any> {
        console.log('uploadProfileImage', this.fbuser.uid);
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.fbuser.uid)
                    .child('profileImage.jpg')
                    .putString(imageData, firebase.storage.StringFormat.DATA_URL, {contentType: 'image/jpeg'});
            uploadTask.on('state_changed', function(snapshot:any) {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.info('Upload is ' + progress + '% done');
            }, function (error:any) {
                // error
                console.log('failed > ', error.code);
                reject(error);
            }, function() {
                // success
                resolve(uploadTask.snapshot);
                console.log('uploadProfileImage > success');
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
            console.log('getPicture > success');
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
            return this.accountSrv.updatePhoto(downloadURL, fullPath);
        })        
        .then((result) => {
            steps.update = true;
            console.log('updateAccount > success', steps);
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
