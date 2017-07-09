import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';

import firebase from 'firebase';

@Component({
    selector: 'modal-user-edit-name',
    templateUrl: 'modal-user-edit-name.html'
})
export class ModalUserEditNamePage implements OnInit{

    editForm: FormGroup;
    firstName: AbstractControl;
    lastName: AbstractControl;
    user: firebase.User;
    accountData: UserProfileData;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        public usersSrv: UsersService,
        public alertCtrl: AlertController,
        public params: NavParams) {
    }

    ngOnInit() {
        // console.log('onOnit');
        // console.log(this.params.data);
        this.accountData = this.params.data.accountData;
        // form init
        this.editForm = this.formBuilder.group({
            'firstName':  [this.accountData.firstName, [Validators.required, Validators.maxLength(50)]],
            'lastName':  [this.accountData.lastName, [Validators.required, Validators.maxLength(50)]],
        });
        this.firstName = this.editForm.controls['firstName'];
        this.lastName = this.editForm.controls['lastName'];
    }

    dismiss(updated:boolean = false) {
        let data = { update: updated };
        this.viewCtrl.dismiss(data);
    }

    submit(formValues: any) {
        console.group('ModalUserEditNamePage')
        console.log('form', formValues);
        this.usersSrv.updateUserNames(formValues.firstName, formValues.lastName)
            .then((result) => {
                console.log('success');
                console.groupEnd();
                // show alert
                let alert = this.alertCtrl.create({
                    title: 'Modificado',
                    subTitle: 'Tu nombre se ha modificado correctamente',
                    buttons: [
                        {
                            text: 'Cerrar',
                            handler: data => {
                                this.dismiss(true);
                            }
                        }
                    ]
                });
                alert.present();
            })
            .catch((error) => {
                console.log('error', error);
                console.groupEnd();
            });
    }

}
