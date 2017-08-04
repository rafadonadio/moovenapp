import { AccountService } from '../../providers/account-service/account-service';
import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase';

@Component({
    selector: 'modal-user-edit-name',
    templateUrl: 'modal-user-edit-name.html'
})
export class ModalUserEditNamePage implements OnInit{

    mform: FormGroup;
    user: firebase.User;
    accountData: UserProfileData;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public fb: FormBuilder,
        public alertCtrl: AlertController,
        public params: NavParams,
        private accountSrv: AccountService) {
    }

    ngOnInit() {
        console.log(this.params.data);
        this.accountData = this.params.data.accountData;
        // form init
        this.mform = this.fb.group({
            firstName: ['', [Validators.required, Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
        });
        // set initial value
        this.mform.controls['firstName'].setValue(this.accountData.firstName);
        this.mform.controls['lastName'].setValue(this.accountData.lastName);
    }

    dismiss(updated:boolean = false) {
        let data = { update: updated };
        this.viewCtrl.dismiss(data);
    }

    submit() {
        console.info('submit')
        this.accountData.firstName = this.mform.value.firstName;
        this.accountData.lastName = this.mform.value.lastName;
        this.accountSrv.updateProfileData(this.accountData)
            .then(() => {
                console.log('success');
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
            .catch((err) => {
                console.log('err', err);
            });
    }

}
