import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
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

    request: any;
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
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public sending: SendingService) {
        }

        ngOnInit() {
            // init data
            this.initRequestData();
            // init form
            this.formOne = this.formBuilder.group({
                'objectImageUrl': ['http://placehold.it/400x250'],
                'objectShortName': ['', Validators.compose([Validators.required, Validators.maxLength(75), Validators.minLength(3)])],
                'objectType': ['', Validators.compose([Validators.required])],
                'objectDeclaredValue': [this.request.objectDeclaredValue, Validators.compose([Validators.required, NumberValidator.nonZero])],
                'objectNoValueDeclared': [false],
            });
            this.objectImageUrl = this.formOne.controls['objectImageUrl'];
            this.objectShortName = this.formOne.controls['objectShortName'];
            this.objectType = this.formOne.controls['objectType'];
            this.objectNoValueDeclared = this.formOne.controls['objectNoValueDeclared'];
            this.objectDeclaredValue = this.formOne.controls['objectDeclaredValue'];
        }

        submitInit() {
            console.log('oneForm > submited');
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
            console.log('formOne > process');
            this.setRequest();
            this.goToNextStep();
        }

        cancelSending() {
            this.navCtrl.setRoot(SendingsPage);
        }

        resetObjectDeclaredValue(e) {
            console.log('declared value reseted');
            this.rangeValue = 0;
        }


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

        private setRequest() {
            console.log('set request values from form');
            // set input values to request
            this.request.objectShortName = this.objectShortName.value;
            this.request.objectType = this.objectType.value;
            this.request.objectNoValueDeclared = this.objectNoValueDeclared.value;
            this.request.objectDeclaredValue = this.objectDeclaredValue.value;
            this.request.objectImageSet = this.isObjectImageSet();
            this.request.objectImageUrl = this.objectImageUrl.value;
            console.log('sending request data ', this.request);
        }

        private goToNextStep() {
            console.log('set nav param and go to next page');
            this.navCtrl.setRoot(SendingCreate2Page, {
                request: this.request
            });
        }

        /**
         *  HELPERS
         */

        private initRequestData() {
            console.log('sending request data > initiated');
            this.request = this.sending.init();
        }

        private isObjectImageSet() {
            return this.objectImageUrl.value === '' ? false : true;
        }

    }
