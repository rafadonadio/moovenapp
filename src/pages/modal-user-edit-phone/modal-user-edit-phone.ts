import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
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
    user: any;
    profile = {
        phonePrefix: '',
        phoneMobile: ''
    };

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        public users: UsersService) {

    }

    ngOnInit() {
        // auth user data
        this.setUser();
        // form init
        this.editForm = this.formBuilder.group({
            'phoneMobile':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
            'phonePrefix':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
        });
        this.phoneMobile = this.editForm.controls['phoneMobile'];
        this.phonePrefix = this.editForm.controls['phonePrefix'];
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    /**
     * PRIVATE
     */

    private setUser() {
        // set user
        this.user = this.users.getUser();
        // set profile
        this.users.getAccountProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
                console.log(this.profile);
        });
    }

}
