import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingsPage} from '../sendings/sendings';
import { SendingCreate2Page} from '../sending-create-2/sending-create-2';
import { SendingCreate4Page} from '../sending-create-4/sending-create-4';

@Component({
    selector: 'page-sending-create-3',
    templateUrl: 'sending-create-3.html'
})
export class SendingCreate3Page implements OnInit{

    formThree: FormGroup;
    dropAddressFullText: any;
    dropTimeFrom: any;
    dropTimeTo: any;
    dropPersonName: any;
    dropPersonPhone: any;
    dropPersonEmail: any;

    sending: any;
    user: any;
    profile: any;
    // aux
    rangeFrom: any;
    rangeTo: any;

    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController) {
    }

    ngOnInit() {
        console.log('f3 > init');
        this.setUser();
        // init form
        this.formThree = this.formBuilder.group({
            'dropAddressFullText': ['', Validators.compose([Validators.required])],
            'dropTimeFrom': ['', Validators.compose([Validators.required])],
            'dropTimeTo': ['', Validators.compose([Validators.required])],
            'dropPersonName': ['', Validators.compose([Validators.required])],
            'dropPersonPhone': ['', Validators.compose([Validators.required])],
            'dropPersonEmail': ['', Validators.compose([Validators.required])],
        });
        this.dropAddressFullText = this.formThree.controls['dropAddressFullText'];
        this.dropTimeFrom = this.formThree.controls['dropTimeFrom'];
        this.dropTimeTo = this.formThree.controls['dropTimeTo'];
        this.dropPersonName = this.formThree.controls['dropPersonName'];
        this.dropPersonPhone = this.formThree.controls['dropPersonPhone'];
        this.dropPersonEmail = this.formThree.controls['dropPersonEmail'];
        // set sending from param
        this.getSendingFromParams();
    }

    adjustDropTimeFrom(e) {
        console.log('f3 > new hour to > ', e.hour.value);
        console.log('f3 > current hour to > ', this.dropTimeFrom.value);
    }
    adjustDropTimeTo(e) {
        console.log('f3 > new hour from > ', e.hour.value);
        console.log('f3 > current hour to > ', this.dropTimeTo.value);
    }

    populateUserData() {
        console.log('f3 > populate dropContact with current user');
        this.dropPersonName.setValue(this.user.displayName);
        this.dropPersonPhone.setValue(this.profile.phonePrefix + this.profile.phoneMobile);
        this.dropPersonEmail.setValue(this.user.email);
    }

    submit() {
        console.log('f3 > process');
        this.updateSending();
        this.goToNextStep();
    }

    goBack() {
        console.log('f3 > go back to f2');
        this.updateSending();
        this.goBacktoStep2();
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
                        console.log('f2 > cancel form > no, continue');

                    }
                },
                {
                    text: 'Si',
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
        console.log('f3 > go to f4, include this.sending in params');
        this.navCtrl.push(SendingCreate4Page, {
            sending: this.sending
        });
    }

    private goBacktoStep2() {
        console.log('f3 > go to f2, include this.sending in params');
        this.navCtrl.push(SendingCreate2Page, {
            sending: this.sending
        });
    }

    private updateSending() {
        console.log('f3 > save form values in this.sending');
        this.sending.dropAddressFullText = this.dropAddressFullText.value;
        this.sending.dropTimeFrom = this.dropTimeFrom.value;
        this.sending.dropTimeTo = this.dropTimeTo.value;
        this.sending.dropPersonName = this.dropPersonName.value;
        this.sending.dropPersonPhone = this.dropPersonPhone.value;
        this.sending.dropPersonEmail = this.dropPersonEmail.value;
        console.log('f3 > this.sending > ', this.sending);
    }

    private getSendingFromParams() {
        console.log('f3 > get navParams > this.sending');
        console.log('f3 > param > ', this.navParams.get('sending'));
        this.sending = this.navParams.get('sending');
        this.populateForm();
    }

    private populateForm() {
        console.log('f3 > populate form with this.sending');
        this.dropAddressFullText.setValue(this.sending.dropAddressFullText);
        //datetime
        this.dropTimeFrom.setValue(this.sending.dropTimeFrom);
        this.dropTimeTo.setValue(this.sending.dropTimeTo);
        this.rangeFrom = this.sending.dropTimeFrom;
        this.rangeTo = this.sending.dropTimeTo;
        // contact
        this.dropPersonName.setValue(this.sending.dropPersonName);
        this.dropPersonPhone.setValue(this.sending.dropPersonPhone);
        this.dropPersonEmail.setValue(this.sending.dropPersonEmail);
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
