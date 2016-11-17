import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
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
    user: firebase.User;
    profData: UserProfileData 

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        public users: UsersService,
        public params: NavParams) {
            this.profData = params.data.profData;
    }

    ngOnInit() {
        // form init
        this.editForm = this.formBuilder.group({
            'firstName':  [this.profData.firstName, Validators.compose([Validators.required, Validators.maxLength(100)])],
            'lastName':  [this.profData.lastName, Validators.compose([Validators.required, Validators.maxLength(100)])],
        });
        this.firstName = this.editForm.controls['firstName'];
        this.lastName = this.editForm.controls['lastName'];
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    submit(formValues: any) {
        console.log('form submitted', formValues);
    }


}
