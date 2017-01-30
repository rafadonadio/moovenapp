import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

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

    signupMergeForm: FormGroup;
    firstName: AbstractControl;
    lastName: AbstractControl;
    phonePrefix: AbstractControl;
    phoneMobile: AbstractControl;
    confirmTos: AbstractControl;
    profileBgDefault: string = 'assets/img/mooven_avatar.png';

    user: firebase.User;

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
        this.signupMergeForm = this.formBuilder.group({
            'firstName': ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'lastName': ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
            'phonePrefix': ['+549', Validators.compose([Validators.required])],
            'phoneMobile': ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(25)])]
        });
        this.firstName = this.signupMergeForm.controls['firstName'];
        this.lastName = this.signupMergeForm.controls['lastName'];
        this.phonePrefix = this.signupMergeForm.controls['phonePrefix'];
        this.phoneMobile = this.signupMergeForm.controls['phoneMobile'];
    }


    submitSignupMergeForm(value: any): void {
        // verify inputs are valid
        if(this.signupMergeForm.valid!==true) {
            // something is not good
            console.log('signupMergeForm = false');
        }else{
            // loader effect
            let loader = this.loadingCtrl.create({
                content: 'Guardando ...',
                dismissOnPageChange: true
            });
            loader.present();
            // profile data
            let profileData = {
                firstName: value.firstName,
                lastName: value.lastName,
                phonePrefix: value.phonePrefix,
                phoneMobile: value.phoneMobile
            };
            // update
            this.users.createAccountStep2(profileData)
                .then((result) => {                    
                    console.log('createAccountStep2 > success', result);
                    this.navCtrl.push(VerifyPhonePage);
                })
                .catch((error) => {
                    console.log('createAccountStep2 > error > ', error);
                    loader.dismiss()
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
                        });
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
            subTitle: 'Si cierras la sesión, puedes completar tu registración la próxima vez que inicies sesión',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Cerrar sesión',
                    handler: () => {
                        this.users.signOut();
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
        console.info('updatePicture');
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
                    this.setUser();
                });
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

    /**
     * PRIVATE
     */

    private uploadProfileImage(imageData: string): Promise<any> {
        console.group('uploadProfileImage');
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
                console.groupEnd();                
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
                console.groupEnd();
                loader.dismiss();
            });                
     }

}
