import { ConfigService } from '../../providers/config-service/config-service';
import { UserAccount, UserProfileData } from '../../models/user-model';
import { Subscription } from 'rxjs/Rx';
import { AccountService } from '../../providers/account-service/account-service';
import { AuthService } from '../../providers/auth-service/auth-service';
import { StartPage } from '../start/start';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalTosPage } from '../modal-tos/modal-tos';
import { VerifyPhonePage } from '../verify-phone/verify-phone';
import { Camera } from '@ionic-native/camera';
import firebase from 'firebase';

const STRG_USER_FILES = 'userFiles/';

@Component({
    selector: 'page-signup-merge',
    templateUrl: 'signup-merge.html'
})
export class SignupMergePage implements OnInit{

    form: FormGroup;
    profileBgDefault: string = 'assets/img/mooven_avatar.png';
    showErrors:boolean = false;
    user: firebase.User;
    loader:any;
    account: UserAccount;
    accountSubs:Subscription;
    tosVersion: any;

    constructor(public navCtrl: NavController,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController,
        public cameraPlugin: Camera,
        public authSrv: AuthService,
        public accountSrv: AccountService,
        public configSrv: ConfigService) {
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            phonePrefix: ['+549', [Validators.required]],
            phoneMobile: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
            tosAccept: [false, []]
        });
        this.setTosVersion();
        this.setUser();
        this.setAccount();
    }

    ionViewWillUnload() {
        this.unsubscribeAccount();
    }

    submit() {
        console.log('submit form, tosAccept', this.form.valid, this.form.get('tosAccept').value);
        if(!this.form.valid || this.form.get('tosAccept').value==false) {
            // something is not good
            this.showErrors = true;
            let alert = this.alertCtrl.create({
                title: 'Datos incompletos',
                subTitle: 'Por favor completa todos los campos, lee y acepta los términos y condiciones',
                buttons: ['Cerrar']
            });
            alert.present();            
        }else{                 
            this.updateAccount();
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
            subTitle: 'Si cierras la sesión, puedes completar tu registración la próxima vez que ingreses',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Cerrar sesión',
                    handler: () => {
                        this.authSrv.signOut();
                        this.navCtrl.push(StartPage);
                    }
                }
            ]
        });
        alert.present();
    }


    /**
     * Take picture and save imageData
     */
    updatePicture() {
        console.info('__UDP__ updatePicture');
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
            console.log('__UDP__1 ok');
            steps.get = true;
            let base64Image: string;
            base64Image = "data:image/jpeg;base64," + imageData;
            return this.uploadProfileImage(base64Image);
        })
        .then((snapshot) => {
            console.log('__UDP__2 ok');
            steps.upload = true;
            let downloadURL = snapshot.downloadURL;
            let fullPath = snapshot.ref.fullPath;
            return this.accountSrv.updatePhoto(downloadURL, fullPath);
        })        
        .then(() => {
            steps.update = true;
            console.log('__UDP__3 ok');
            this.authSrv.reload();
            let toast = this.toastCtrl.create({
                message: 'Tu foto de perfil fue actualizada!',
                duration: 3000,
                position: 'top'
            });
            toast.present();
        })
        .catch((error) => {
            console.error('__UDP__', error, steps);
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Ocurrió un error, por favor vuelve a intentarlo',
                buttons: ['Cerrar']
            });
            alert.present();
        });
    }

    /**
     * PRIVATE
     */


    private updateAccount(): void {
        console.log('updateAccount');
        this.showErrors = false;
        // loader effect
        this.loader = this.loadingCtrl.create({
            content: 'Guardando ...',
        });
        this.loader.present();
        // profile data
        let profileData: UserProfileData = this.account.profile.data;
        // copy form values
        profileData.firstName = this.form.value.firstName;
        profileData.lastName = this.form.value.lastName;
        profileData.phonePrefix = this.form.value.phonePrefix;
        profileData.phoneMobile = this.form.value.phoneMobile;
        profileData.lastTosAccepted = this.tosVersion;
        // update
        this.accountSrv.updateProfileData(profileData)
            .then(() => {                    
                console.log('update profile success');
                this.loader.dismiss()
                    .then(() => {
                        this.navCtrl.setRoot(VerifyPhonePage);
                    })
                    .catch(error => console.log('dismiss error', error));
            })
            .catch((error) => {
                console.error('update profile success', error);
                this.loader.dismiss()
                    .then(() => {
                        let alert = this.alertCtrl.create({
                            title: 'Atención',
                            subTitle: 'Ocurrió un error al completar tu cuenta, por favor vuelve a intentarlo',
                            buttons: [
                                {
                                    text: 'Cerrar',
                                    role: 'cancel'
                                }
                            ]
                        });
                        alert.present();
                    })
                    .catch(error => console.log(error));
            });
    }

    private uploadProfileImage(imageData: string): Promise<any> {
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.user.uid)
                    .child('profileImage.jpg')
                    .putString(imageData, firebase.storage.StringFormat.DATA_URL, {contentType: 'image/jpeg'});
            uploadTask.on('state_changed', function(snapshot:any) {
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
                });
        });
    }

     private setUser() {
        this.user = this.authSrv.fbuser;             
     }

    private setTosVersion() {
        let obs = this.configSrv.getCurrentToS();
        let subs = obs.subscribe(snap => {
                        console.log('success tosData', snap.val());
                        this.tosVersion = snap.val().version;
                        subs.unsubscribe();
                    }, error=> {
                        console.log(error, console.log('tosData error', error));
                    });   
    }     

     private setAccount() {
        let obs = this.accountSrv.getObs(true);
        this.accountSubs = obs.subscribe(snap => {
                                console.log('success snap', snap.val());
                                this.account = snap.val();
                                // set form values
                                this.form.controls['firstName'].setValue(this.account.profile.data.firstName);
                                this.form.controls['lastName'].setValue(this.account.profile.data.lastName);
                                this.form.controls['phoneMobile'].setValue(this.account.profile.data.phoneMobile);
                            }, error => {
                                console.log('error', error);
                            });
    }
    private unsubscribeAccount() {
        if(this.accountSubs) {
            this.accountSubs.unsubscribe();
        }
    }

}
