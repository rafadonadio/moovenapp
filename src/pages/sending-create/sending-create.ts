import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import { SendingsPage } from '../sendings/sendings';
import { SendingCreate2Page } from '../sending-create-2/sending-create-2';
import { NumberValidator } from '../../validators/number.validator';

import { Camera } from 'ionic-native';


@Component({
    selector: 'page-sending-create',
    templateUrl: 'sending-create.html'
})
export class SendingCreatePage implements OnInit {

    sending: any;
    formOne: FormGroup;
    objectImageUrl: AbstractControl;
    objectShortName: AbstractControl;
    objectType: AbstractControl;
    objectNoValueDeclared: AbstractControl;
    objectDeclaredValue: AbstractControl;
    //aux
    rangeValue: any = 0;
    cameraDefaultBg = 'assets/img/camera-bg-900x900.png';

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public sendingSrv: SendingService) {
    }

    ngOnInit() {
        console.log('f1 > init');
        // init form
        this.formOne = this.formBuilder.group({
            'objectImageUrl': [''],
            'objectShortName': ['', Validators.compose([Validators.required, Validators.maxLength(75), Validators.minLength(3)])],
            'objectType': ['', Validators.compose([Validators.required])],
            'objectDeclaredValue': ['', Validators.compose([Validators.required, NumberValidator.nonZero])],
            'objectNoValueDeclared': [false],
        });
        this.objectImageUrl = this.formOne.controls['objectImageUrl'];
        this.objectShortName = this.formOne.controls['objectShortName'];
        this.objectType = this.formOne.controls['objectType'];
        this.objectNoValueDeclared = this.formOne.controls['objectNoValueDeclared'];
        this.objectDeclaredValue = this.formOne.controls['objectDeclaredValue'];

        // init data
        this.initSending();
    }

    submitInit() {
        console.log('formOne > submited > confirm? ...');
        // if not 'sobre' and photo not added, ask to add photo
        if (this.objectImageUrl.value === '') {
            let alert = this.alertCtrl.create({
                title: 'Confirmar',
                message: 'Seguro no deseas incluir una foto?',
                buttons: [
                    {
                        text: 'Volver y agregar una foto',
                        role: 'cancel',
                        handler: () => {
                            console.log('select: return to oneForm and add photo');
                        }
                    },
                    {
                        text: 'Continuar sin foto',
                        handler: () => {
                            console.log('select: go to process formOne');
                            this.submitProcess();
                        }
                    }
                ]
            });
            alert.present();
        } else {
            this.submitProcess();
        }
    }

    submitProcess() {
        console.log('formOne > process > set this.sending');
        this.saveSending();
        this.goToNextStep();
    }

    cancelSending() {
        let alert = this.alertCtrl.create({
            title: '¿Cancelar Envío?',
            message: 'Se perderán todos los datos ingresados del Nuevo Envío.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('formOne > cancel > no, continue');

                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        console.log('formOne > cancel > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     * Reset value of range input
     */
    resetObjectDeclaredValue(e) {
        console.log('formOne.objectDeclaredValue > reseted');
        this.rangeValue = 0;
    }

    /**
     * Take picture and save imageData
     */
    takePicture() {
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
                let base64Image: string;
                base64Image = "data:image/jpeg;base64," + imageData;
                this.objectImageUrl.setValue(base64Image);
            }, (error) => {
                console.log("ERROR -> " + JSON.stringify(error));
            });
    }


    /**
    *  PRIVATE
    */

    private saveSending() {
        console.log('formOne > save form values in this.sending');
        // set input values to request
        this.sending.objectShortName = this.objectShortName.value;
        this.sending.objectType = this.objectType.value;
        this.sending.objectNoValueDeclared = this.objectNoValueDeclared.value;
        this.sending.objectDeclaredValue = this.objectDeclaredValue.value;
        this.sending.objectImageSet = this.isObjectImageSet();
        this.sending.objectImageUrl = this.objectImageUrl.value;
        console.log('formOne > this.sending > ', this.sending);
    }

    private goToNextStep() {
        console.log('formOne > go to formTwo, include this.sending in params');
        this.navCtrl.setRoot(SendingCreate2Page, {
            sending: this.sending
        });
    }

    /**
     *  HELPERS
     */

    private initSending() {
        // check if sending exist in params, else initiate it
        let paramValue = this.navParams.get('sending');
        console.log('formOne > initSending > navParam value > ', paramValue);
        if (paramValue) {
            console.log('formOne > this.sending set from param');
            this.sending = paramValue;
            // populate inputs
            this.populateForm();
        }
        else {
            console.log('formOne > this.sending > initiated');
            this.sending = this.sendingSrv.init();
        }
        console.log('formOne > this.sending > ', this.sending);
    }

    private isObjectImageSet() {
        return this.objectImageUrl.value === '' ? false : true;
    }

    private populateForm() {
        console.log('formOne > populate form values with this.sending');
        // set input values to request
        this.objectShortName.setValue(this.sending.objectShortName);
        this.objectType.setValue(this.sending.objectType);
        this.objectNoValueDeclared.setValue(this.sending.objectNoValueDeclared);
        this.objectDeclaredValue.setValue(this.sending.objectDeclaredValue);
        this.rangeValue = this.sending.objectDeclaredValue;
        this.objectImageUrl.setValue(this.sending.objectImageUrl);
    }

}
