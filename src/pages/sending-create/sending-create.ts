import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingService } from  '../../providers/sending-service/sending-service';
import { SendingsPage} from '../sendings/sendings';
import { SendingCreate2Page} from '../sending-create-2/sending-create-2';
import { NumberValidator } from '../../validators/number.validator';

import { Camera } from 'ionic-native';


@Component({
    selector: 'page-sending-create',
    templateUrl: 'sending-create.html'
})
export class SendingCreatePage implements OnInit{

    sending: any;
    formOne: FormGroup;
    objectImageUrl: AbstractControl;
    objectShortName: AbstractControl;
    objectType: AbstractControl;
    objectNoValueDeclared: AbstractControl;
    objectDeclaredValue: AbstractControl;
    //aux
    rangeValue: any = 0;
    formValid:boolean = false;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public sendingSrv: SendingService) {
        }

        ngOnInit() {
            // init form
            this.formOne = this.formBuilder.group({
                'objectImageUrl': ['http://placehold.it/400x250'],
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
            console.log('formOne > submited');
            // if not 'sobre' and photo not added, confirm its ok
            if(this.objectImageUrl.value === '') {
                let alert = this.alertCtrl.create({
                    title: 'Confirmar',
                    message: 'Seguro no deseas incluir una foto?',
                    buttons: [
                        {
                            text: 'Volver y agregar una foto',
                            role: 'cancel',
                            handler: () => {
                                console.log('returned to oneForm > add photo');
                            }
                        },
                        {
                            text: 'Continuar sin foto',
                            handler: () => {
                                console.log('go to process');
                                this.submitProcess();
                            }
                        }
                    ]
                });
                alert.present();
            }else{
                this.submitProcess();
            }
        }

        submitProcess() {
            console.log('formOne > process > set request');
            this.saveSending();
            this.goToNextStep();
        }

        cancelSending() {
            let alert = this.alertCtrl.create({
                title: '¿Seguro deseas cancelar?',
                message: 'Se perderán todos los datos ingresados del Nuevo Envío.',
                buttons: [
                    {
                        text: 'No, continuar',
                        role: 'cancel',
                        handler: () => {
                            console.log('Cancel sending > canceled');

                        }
                    },
                    {
                        text: 'Si, cancelar',
                        handler: () => {
                            console.log('Sending create > canceled');
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
                quality : 95,
                destinationType : Camera.DestinationType.DATA_URL,
                sourceType : Camera.PictureSourceType.CAMERA,
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: true,
                correctOrientation: true
            })
            .then(imageData => {
                let base64Image: string;
                base64Image = "data:image/jpeg;base64," + imageData;
                this.objectImageUrl.setValue(base64Image);
            }, error => {
                console.log("ERROR -> " + JSON.stringify(error));
            });
        }     


        /**
        *  PRIVATE
        */

        private saveSending() {
            console.log('Save formOne values in this.sending');
            // set input values to request
            this.sending.objectShortName = this.objectShortName.value;
            this.sending.objectType = this.objectType.value;
            this.sending.objectNoValueDeclared = this.objectNoValueDeclared.value;
            this.sending.objectDeclaredValue = this.objectDeclaredValue.value;
            this.sending.objectImageSet = this.isObjectImageSet();
            this.sending.objectImageUrl = this.objectImageUrl.value;
            console.log('this.sending data > ', this.sending);
        }

        private goToNextStep() {
            console.log('Go to formTwo, include this.sending in params');
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
            console.log('this.navParams.get("sending") value > ', paramValue);
            if(paramValue) {
                console.log('this.sending data > set from param');
                this.sending = paramValue;
                // populate inputs
                this.populateForm();
            }   
            else{
                console.log('this.sending data > initiated');
                this.sending = this.sendingSrv.init();
            }         
        }

        private isObjectImageSet() {
            return this.objectImageUrl.value === '' ? false : true;
        }

        private populateForm() {
            console.log('Populate form with this.sending');
            // set input values to request
            this.objectShortName.setValue(this.sending.objectShortName);
            this.objectType.setValue(this.sending.objectType);
            this.objectNoValueDeclared.setValue(this.sending.objectNoValueDeclared);
            
            this.objectDeclaredValue.setValue(this.sending.objectDeclaredValue);
            this.rangeValue = this.sending.objectDeclaredValue;
            
            this.objectImageUrl.setValue(this.sending.objectImageUrl);            
        }

    }
