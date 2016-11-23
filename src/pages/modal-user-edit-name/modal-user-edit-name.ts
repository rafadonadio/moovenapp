import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
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
    profData: UserProfileData;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        public usersSrv: UsersService,
        public alertCtrl: AlertController,
        public params: NavParams) {
            this.profData = params.data.profData;
    }

    ngOnInit() {
        // form init
        this.editForm = this.formBuilder.group({
            'firstName':  [this.profData.firstName, Validators.compose([Validators.required, Validators.maxLength(50)])],
            'lastName':  [this.profData.lastName, Validators.compose([Validators.required, Validators.maxLength(50)])],
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
