import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';

@Component({
    selector: 'modal-user-edit-phone',
    templateUrl: 'modal-user-edit-phone.html'
})
export class ModalUserEditPhonePage implements OnInit{

    editForm: FormGroup;
    phoneMobile: AbstractControl;
    phonePrefix: AbstractControl;
    user: firebase.User;
    profData: UserProfileData;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        public users: UsersService,
        public params:NavParams) {
            this.profData = params.data.profData;
    }

    ngOnInit() {
        // form init
        this.editForm = this.formBuilder.group({
            'phonePrefix':  [this.profData.phonePrefix, Validators.compose([Validators.required, Validators.maxLength(100)])],
            'phoneMobile':  [this.profData.phoneMobile, Validators.compose([Validators.required, Validators.maxLength(100)])],
        });
        this.phoneMobile = this.editForm.controls['phoneMobile'];
        this.phonePrefix = this.editForm.controls['phonePrefix'];
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

}
