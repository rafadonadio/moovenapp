import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { SendingService } from  '../../providers/sending-service/sending-service';
import { SendingCreate4Page} from '../sending-create-4/sending-create-4';
import { NumberValidator } from '../../shared/validators/number.validator';

@Component({
    templateUrl: 'sending-create-3.html',
    providers: [UsersService, SendingService],
    directives: [FORM_DIRECTIVES]
})
export class SendingCreate3Page implements OnInit{

    formThree: FormGroup;
    dropAddressFullText: AbstractControl;
    dropTimeFrom: AbstractControl;
    dropTimeTo: AbstractControl;
    dropPersonName: AbstractControl;
    dropPersonPhone: AbstractControl;
    dropPersonEmail: AbstractControl;

    request: any;
    user: any;
    profile: any;
    // aux
    rangeFrom: any = '14:00';
    rangeTo: any = "16:00";
    contactName: string;
    contactPhone: string;
    contactEmail: string;

    constructor(private navCtrl: NavController,
        private navParams: NavParams,
        private users: UsersService,
        private formBuilder: FormBuilder,
        private alertCtrl: AlertController,
        private sending: SendingService) {
    }

    ngOnInit() {
        this.setUser();
        // set request from param
        this.getRequestFromParams();
        // init form
        this.formThree = this.formBuilder.group({
            'dropAddressFullText': ['', Validators.compose([Validators.required])],
            'dropTimeFrom': ['14:00', Validators.compose([Validators.required])],
            'dropTimeTo': ['16:00', Validators.compose([Validators.required])],
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
    }

    submit() {
        console.log('formThree > process');
        this.setRequest();
        this.goToNextStep();
    }

    adjustDropTimeFrom(e) {
        console.log('new hour to > ', e.hour.value);
        console.log('current hour to > ', this.dropTimeFrom.value);
    }
    adjustDropTimeTo(e) {
        console.log('new hour from > ', e.hour.value);
        console.log('current hour to > ', this.dropTimeTo.value);
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
        this.navCtrl.push(SendingCreate4Page, {
            request: this.request
        });
    }

    private setRequest() {
        console.log('set request values from form');
        this.request.dropAddressFullText = this.dropAddressFullText.value;
        this.request.dropTimeFrom = this.dropTimeFrom.value;
        this.request.dropTimeTo = this.dropTimeTo.value;
        this.request.dropPersonName = this.dropPersonName.value;
        this.request.dropPersonPhone = this.dropPersonPhone.value;
        this.request.dropPersonEmail = this.dropPersonEmail.value;
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
