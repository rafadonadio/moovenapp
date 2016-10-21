import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingsPage } from '../sendings/sendings';
import { SendingCreatePage } from '../sending-create/sending-create';
import { SendingCreate3Page } from '../sending-create-3/sending-create-3';

@Component({
    selector: 'page-sending-create-2',
    templateUrl: 'sending-create-2.html'
})
export class SendingCreate2Page implements OnInit{

    formTwo: FormGroup;
    pickupAddressFullText: AbstractControl;
    pickupTimeFrom: AbstractControl;
    pickupTimeTo: AbstractControl;
    pickupPersonName: AbstractControl;
    pickupPersonPhone: AbstractControl;
    pickupPersonEmail: AbstractControl;

    sending: any;
    user: any;
    profile: any;
    // aux
    rangeFrom: any;
    rangeTo: any;
    contactName: string;
    contactPhone: string;
    contactEmail: string;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController) {
    }

    ngOnInit() {
        this.setUser();
        // init form
        this.formTwo = this.formBuilder.group({
            'pickupAddressFullText': ['', Validators.compose([Validators.required])],
            'pickupTimeFrom': ['09:00', Validators.compose([Validators.required])],
            'pickupTimeTo': ['11:00', Validators.compose([Validators.required])],
            'pickupPersonName': ['', Validators.compose([Validators.required])],
            'pickupPersonPhone': ['', Validators.compose([Validators.required])],
            'pickupPersonEmail': ['', Validators.compose([Validators.required])],
        });
        this.pickupAddressFullText = this.formTwo.controls['pickupAddressFullText'];
        this.pickupTimeFrom = this.formTwo.controls['pickupTimeFrom'];
        this.pickupTimeTo = this.formTwo.controls['pickupTimeTo'];
        this.pickupPersonName = this.formTwo.controls['pickupPersonName'];
        this.pickupPersonPhone = this.formTwo.controls['pickupPersonPhone'];
        this.pickupPersonEmail = this.formTwo.controls['pickupPersonEmail'];
        // set request from param
        this.getSendingFromParams();
    }

    submit() {
        console.log('f2 > process');
        this.updateSending();
        this.goToNextStep();
    }

    adjustPickupTimeFrom(e) {
        console.log('f2 > new hour to > ', e.hour.value);
        console.log('f2 > current hour to > ', this.pickupTimeFrom.value);
    }
    adjustPickupTimeTo(e) {
        console.log('f2 > new hour from > ', e.hour.value);
        console.log('f2 > current hour to > ', this.pickupTimeTo.value);
    }

    populateUserDataInContact() {
        console.log('f2 > populate pickupContact with current user');
        this.pickupPersonName.setValue(this.user.displayName);
        this.pickupPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.pickupPersonEmail.setValue(this.user.email);         
    }

    goBack() {
        console.log('f2 > go back to f1');
        this.updateSending();
        this.goBacktoStep1();
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
                        console.log('f2 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si, cancelar',
                    handler: () => {
                        console.log('f2 > cancel form > yes, cancel');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    }

    /**
     *  PRIVATE
     */

    private goToNextStep() {
        console.log('f2 > go to f3, include this.sending in params');
        this.navCtrl.push(SendingCreate3Page, {
            request: this.sending
        });
    }

    private goBacktoStep1() {
        console.log('f2 > go to f1, include this.sending in params');
        this.navCtrl.push(SendingCreatePage, {
            sending: this.sending
        });
    }

    private updateSending() {
        console.log('f2 > save form values in this.sending');
        this.sending.pickupAddressFullText = this.pickupAddressFullText.value;
        this.sending.pickupTimeFrom = this.pickupTimeFrom.value;
        this.sending.pickupTimeTo = this.pickupTimeTo.value;
        this.sending.pickupPersonName = this.pickupPersonName.value;
        this.sending.pickupPersonPhone = this.pickupPersonPhone.value;
        this.sending.pickupPersonEmail = this.pickupPersonEmail.value;
        console.log('f2 > this.sending > ', this.sending);
    }

    private getSendingFromParams() {
        console.log('f2 > get navParams > this.sending');
        console.log('f2 > param > ', this.navParams.get('sending'));        
        this.sending = this.navParams.get('sending');
        this.populateForm();
    }

    private populateForm() {
        console.log('f2 > populate form with this.sending');
        this.pickupAddressFullText.setValue(this.sending.pickupAddressFullText);
        //datetime
        this.pickupTimeFrom.setValue(this.sending.pickupTimeFrom);       
        this.pickupTimeTo.setValue(this.sending.pickupTimeTo);
        this.rangeFrom = this.sending.pickupTimeFrom;
        this.rangeTo = this.sending.pickupTimeTo;
        // contact
        this.pickupPersonName.setValue(this.sending.pickupPersonName);
        this.pickupPersonPhone.setValue(this.sending.pickupPersonPhone);
        this.pickupPersonEmail.setValue(this.sending.pickupPersonEmail);       
    }

    private setUser(){
        this.user = this.users.getCurrentUser();
        // set profile
        this.users.getCurrentUserProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
        });
    }

}
