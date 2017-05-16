import { StartPage } from '../start/start';
import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { VerifyPhonePage } from '../verify-phone/verify-phone';
import { ModalTosPage } from '../modal-tos/modal-tos';

import { Camera } from 'ionic-native';

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

    constructor(public navCtrl: NavController,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public modalCtrl: ModalController) {
    }

    ngOnInit() {
        this.setUser();
        this.form = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            phonePrefix: ['+549', [Validators.required]],
            phoneMobile: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(25)]],
            tosAccept: [false, []]
        });
    }


    submit(): void {
        console.info('__SMF__ SignupMergeForm');
        console.log('__SMF__ ',this.form.valid, this.form.get('tosAccept').value);
        let values = this.form.value;
        // verify inputs are valid
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
            this.showErrors = false;
            // loader effect
            this.loader = this.loadingCtrl.create({
                content: 'Guardando ...'
            });
            this.loader.present();
            // profile data
            let profileData = {
                firstName: values.firstName,
                lastName: values.lastName,
                phonePrefix: values.phonePrefix,
                phoneMobile: values.phoneMobile
            };
            // update
            console.info('__CA2__ createAccountStep2');
            this.users.createAccountStep2(profileData)
                .then((result) => {                    
                    console.log('__CA2__', result);
                    this.loader.dismiss()
                        .then(() => {
                            this.navCtrl.setRoot(VerifyPhonePage);
                        })
                        .catch(error => console.log(error));
                })
                .catch((error) => {
                    console.error('__CA2__', error);
                    this.loader.dismiss()
                        .then(() => {
                            let alert = this.alertCtrl.create({
                                title: 'Atención',
                                subTitle: 'Ocurrió un error al crear tu cuenta, por favor vuelve a intentarlo',
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
                        this.users.signOut();
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
            return this.users.updateAccountImage(downloadURL, fullPath);
        })        
        .then((result) => {
            steps.update = true;
            console.log('__UDP__3 ok');
            let toast = this.toastCtrl.create({
                message: 'Tu foto de perfil fue actualizada!',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            toast.dismiss()
                .then(() => {
                    this.setUser();
                });
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

    private uploadProfileImage(imageData: string): Promise<any> {
        const storageRef = firebase.storage().ref(STRG_USER_FILES);
        return new Promise((resolve, reject) => {
            // upload 
            let uploadTask = storageRef
                    .child(this.user.uid)
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
                });
        });
    }

     private setUser() {
        // show loader
        let loader = this.loadingCtrl.create({
            content: "Inicializando cuenta ...",
        });
        loader.present();
        this.users.reloadUser()
            .then(() => {
                this.user = this.users.getUser();
                loader.dismiss(); 
            })
            .catch((error) => {
                console.log('setAccountData > error ', error);
                loader.dismiss();
            });                
     }

}
