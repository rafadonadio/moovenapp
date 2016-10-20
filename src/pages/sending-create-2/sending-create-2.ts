import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingCreatePage} from '../sending-create/sending-create';
import { SendingCreate3Page} from '../sending-create-3/sending-create-3';

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
    rangeFrom: any = '09:00';
    rangeTo: any = "11:00";
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
        // set request from param
        this.getSendingFromParams();
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
    }

    submit() {
        console.log('formTwo > process');
        this.updateSending();
        this.goToNextStep();
    }

    adjustPickupTimeFrom(e) {
        console.log('new hour to > ', e.hour.value);
        console.log('current hour to > ', this.pickupTimeFrom.value);
    }
    adjustPickupTimeTo(e) {
        console.log('new hour from > ', e.hour.value);
        console.log('current hour to > ', this.pickupTimeTo.value);
    }

    populateUserData() {
        console.log('populate user data to pickup contact');
        this.contactName = this.user.displayName;
        this.contactPhone = this.profile.phonePrefix + this.profile.phoneMobile;
        this.contactEmail = this.user.email;
    }

    goBack() {
        this.updateSending();
        this.goBacktoStep1();
    }

    cancelSending() {
        console.log('cancel sending');
    }

    /**
     *  PRIVATE
     */

    private goToNextStep() {
        console.log('Go to formThree, include this.sending in params');
        this.navCtrl.push(SendingCreate3Page, {
            request: this.sending
        });
    }

    private goBacktoStep1() {
        console.log('Go to formOne, include this.sending in params');
        this.navCtrl.push(SendingCreatePage, {
            sending: this.sending
        });
    }

    private updateSending() {
        console.log('Save formTwo values in this.sending');
        this.sending.pickupAddressFullText = this.pickupAddressFullText.value;
        this.sending.pickupTimeFrom = this.pickupTimeFrom.value;
        this.sending.pickupTimeTo = this.pickupTimeTo.value;
        this.sending.pickupPersonName = this.pickupPersonName.value;
        this.sending.pickupPersonPhone = this.pickupPersonPhone.value;
        this.sending.pickupPersonEmail = this.pickupPersonEmail.value;
        console.log('this.sending data > ', this.sending);
    }

    private getSendingFromParams() {
        this.sending = this.navParams.get('sending');
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
