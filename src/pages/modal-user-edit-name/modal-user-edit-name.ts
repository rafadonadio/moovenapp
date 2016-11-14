import { Component, OnInit } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';

@Component({
    selector: 'modal-user-edit-name',
    templateUrl: 'modal-user-edit-name.html'
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
            'firstName':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
            'lastName':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
        });
        this.firstName = this.editForm.controls['firstName'];
        this.lastName = this.editForm.controls['lastName'];
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    submit(formValues: any) {
        console.log('form submitted');
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
