import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';

@Component({
    templateUrl: 'modal-user-edit-name.html',
    directives: [FORM_DIRECTIVES]
})
export class ModalUserEditNamePage implements OnInit{

    editForm: FormGroup;
    firstName: AbstractControl;
    lastName: AbstractControl;
    user: any;
    profile = {
        firstName: '',
        lastName: ''
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
            'firstName':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
            'lastName':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
        });
        this.firstName = this.editForm.controls['firstName'];
        this.lastName = this.editForm.controls['lastName'];
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
