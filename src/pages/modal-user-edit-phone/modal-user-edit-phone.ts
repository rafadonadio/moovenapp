import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';

@Component({
    templateUrl: 'modal-user-edit-phone.html',
    directives: [FORM_DIRECTIVES]
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

    constructor(private navCtrl: NavController,
        private viewCtrl: ViewController,
        private formBuilder: FormBuilder,
        private users: UsersService) {

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
        this.user = this.users.getCurrentUser();
        // set profile
        this.users.getCurrentUserProfile()
            .then((snapshot) => {
                this.profile = snapshot.val();
                console.log(this.profile);
        });
    }

}
