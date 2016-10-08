import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingService } from  '../../providers/sending-service/sending-service';
import { SendingCreate3Page} from '../sending-create-3/sending-create-3';
import { NumberValidator } from '../../shared/validators/number.validator';

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

    request: any;
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
        public alertCtrl: AlertController,
        public sending: SendingService) {
    }

    ngOnInit() {
        this.setUser();
        // set request from param
        this.getRequestFromParams();
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
        this.setRequest();
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

    /**
     *  PRIVATE
     */

    private goToNextStep() {
        console.log('set nav param and go to next page');
        this.navCtrl.push(SendingCreate3Page, {
            request: this.request
        });
    }

    private setRequest() {
        console.log('set request values from form');
        this.request.pickupAddressFullText = this.pickupAddressFullText.value;
        this.request.pickupTimeFrom = this.pickupTimeFrom.value;
        this.request.pickupTimeTo = this.pickupTimeTo.value;
        this.request.pickupPersonName = this.pickupPersonName.value;
        this.request.pickupPersonPhone = this.pickupPersonPhone.value;
        this.request.pickupPersonEmail = this.pickupPersonEmail.value;
        console.log('sending request data ', this.request);
    }

    private getRequestFromParams() {
        this.request = this.navParams.get('request');
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
