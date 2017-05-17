import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    objectImageUrlTemp: any;
    objectShortName: any;
    objectType: any;
    objectNoValueDeclared: any;
    objectDeclaredValue: any;
    noValueToggle:any;
    //aux
    showErrors:boolean = false;
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
            'objectImageUrlTemp': [''],
            'objectShortName': ['', Validators.compose([Validators.required, Validators.maxLength(75), Validators.minLength(3)])],
            'objectType': ['', Validators.compose([Validators.required])],
            'objectDeclaredValue': ['', Validators.compose([Validators.required, NumberValidator.nonZero])],
            'objectNoValueDeclared': [false],
        });
        this.objectImageUrlTemp = this.formOne.controls['objectImageUrlTemp'];
        this.objectShortName = this.formOne.controls['objectShortName'];
        this.objectType = this.formOne.controls['objectType'];
        this.objectNoValueDeclared = this.formOne.controls['objectNoValueDeclared'];
        this.objectDeclaredValue = this.formOne.controls['objectDeclaredValue'];

        // init data
        this.initSending();
    }

    submit() {
        console.log('f1 > submited');
        if(!this.isFormValid()) {
            console.log('f1 > submit > invalid');
            this.showErrors = true;
        }else{    
            console.log('f1 > submit > valid');
            this.showErrors = false;                 
            // if objectType not 'sobre' and photo not added, ask to add photo
            if (this.objectType!='sobre' && this.objectImageUrlTemp.value === '') {
                console.log('f1 > submit > showPictureAlert');
                this.showPictureAlert();
            } else {
                this.processForm();
            }    
        }    
    }

    processForm() {
        console.log('f1 > processForm');
        this.saveSending();
        this.goToNextStep();
    }

    cancelSending() {
        let alert = this.alertCtrl.create({
            title: '¿Deseas cancelar?',
            message: 'Se perderán todos los datos ingresados del Nuevo Servicio.',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                        console.log('f1 > cancel > no, continue');

                    }
                },
                {
                    text: 'Si',
                    handler: () => {
                        console.log('f1 > cancel > yes, cancel');
                        alert.dismiss()
                            .then(() => {
                                this.navCtrl.setRoot(SendingsPage);
                            })
                            .catch((error) => console.log(error));                        
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     * Reset value of range input
     */
    resetObjectDeclaredValue() {
        console.log('f1 > no value toggle', this.noValueToggle);
        if(this.noValueToggle == true) {
            this.rangeValue = 0;    
            this.formOne.controls['objectDeclaredValue'].disable();
        }else{
            this.formOne.controls['objectDeclaredValue'].enable();
        }
    }

    /**
     * Take picture and save imageData
     */
    takePicture() {
        console.log('f1 > takePicture');
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
            console.log('f1 > takePicture > success');
            let base64Image: string;
            base64Image = "data:image/jpeg;base64," + imageData;
            this.objectImageUrlTemp.setValue(base64Image);
        }, (error) => {
            console.log('f1 > takePicture > error > ' + JSON.stringify(error));
        });
    }


    /**
    *  PRIVATE
    */

    private isFormValid() {
        var valid = this.objectShortName.valid 
                        && this.objectType.valid 
                        && (this.objectNoValueDeclared.value || this.objectDeclaredValue.valid); 
        console.log('f1 > isFormValid > ', valid);
        return valid;
    }

    private saveSending() {
        console.log('f1 > saveSending ...');
        // set input values to request
        this.sending.objectShortName = this.objectShortName.value;
        this.sending.objectType = this.objectType.value;
        this.sending.objectNoValueDeclared = this.objectNoValueDeclared.value;
        this.sending.objectDeclaredValue = this.objectDeclaredValue.value;
        this.sending.objectImageSet = this.isObjectImageSet();
        this.sending.objectImageUrlTemp = this.objectImageUrlTemp.value;
        console.log('f1 > saveSending > this.sending > ', this.sending);
    }

    private goToNextStep() {
        console.log('f1 > goToNextStep > f2 > include this.sending in params');
        this.navCtrl.setRoot(SendingCreate2Page, {
            sending: this.sending
        });
    }

    /**
     *  HELPERS
     */

    private showPictureAlert() {
        let alert = this.alertCtrl.create({
            title: 'Confirmar',
            message: 'Seguro no deseas incluir una foto?',
            buttons: [
                {
                    text: 'Volver y agregar una foto',
                    role: 'cancel',
                    handler: () => {
                        console.log('f1 > showPictureAlert > return and add photo');
                    }
                },
                {
                    text: 'Continuar sin foto',
                    handler: () => {
                        console.log('f1 > showPictureAlert > continue and processForm');
                        this.processForm();
                    }
                }
            ]
        });
        alert.present();        
    }

    private initSending() {
        // check if sending exist in params, else initiate it
        let paramValue = this.navParams.get('sending');
        console.log('f1 > initSending > navParam? > ', paramValue);
        if (paramValue) {
            console.log('f1 > initSending > this.sending set from param');
            this.sending = paramValue;
            // populate inputs
            this.populateForm();
        }
        else {
            console.log('f1 > initSending > this.sending initiated');
            this.sending = this.sendingSrv.initObj();
        }
        console.log('f1 > this.sending > ', this.sending);
    }

    private isObjectImageSet() {
        return this.objectImageUrlTemp.value === '' ? false : true;
    }

    private populateForm() {
        console.log('f1 > populateForm > with this.sending');
        // set input values to request
        this.objectShortName.setValue(this.sending.objectShortName);
        this.objectType.setValue(this.sending.objectType);
        this.objectNoValueDeclared.setValue(this.sending.objectNoValueDeclared);
        this.objectDeclaredValue.setValue(this.sending.objectDeclaredValue);
        this.rangeValue = this.sending.objectDeclaredValue;
        this.objectImageUrlTemp.setValue(this.sending.objectImageUrlTemp);
    }

}
