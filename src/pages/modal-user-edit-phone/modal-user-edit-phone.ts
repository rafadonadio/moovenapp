import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
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
    changeInProcess: boolean;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        public users: UsersService,
        public params:NavParams) {
            this.profData = this.params.get('profData');
            this.changeInProcess = false;
    }

    ngOnInit() {
        // form init
        this.editForm = this.formBuilder.group({
            'phonePrefix':  ['+549', Validators.compose([Validators.required, Validators.maxLength(100)])],
            'phoneMobile':  ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
        });
        this.phoneMobile = this.editForm.controls['phoneMobile'];
        this.phonePrefix = this.editForm.controls['phonePrefix'];
    }

    dismiss(updated:boolean = false) {
        let data = { update: updated };
        this.viewCtrl.dismiss(data);
    }

    submit(formValues: any) {
        console.group('ModalUserEditPhonePage');
        console.log('form', formValues);
        this.users.updatePhoneMobile(formValues.phonePrefix, formValues.phoneMobile)
            .then((result) => {
                console.log('success');
                console.groupEnd();
                // show alert
                let alert = this.alertCtrl.create({
                    title: 'Modificado',
                    subTitle: 'Tu número de móvil ha modificado correctamente.',
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
