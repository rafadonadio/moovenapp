import { AccountService } from '../../providers/account-service/account-service';
import { UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '../../validators/number.validator';

@Component({
    selector: 'modal-user-edit-phone',
    templateUrl: 'modal-user-edit-phone.html'
})
export class ModalUserEditPhonePage implements OnInit{

    editForm: FormGroup;
    user: firebase.User;
    accountData: UserProfileData;
    changeInProcess: boolean;
    showError: boolean;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public formBuilder: FormBuilder,
        public params:NavParams,
        private accountSrv: AccountService) {
            this.accountData = this.params.get('accountData');
            this.changeInProcess = false;
    }

    ngOnInit() {
        // form init
        this.showError = false;
        this.editForm = this.formBuilder.group({
            'phonePrefix':  [this.accountData.phonePrefix, Validators.compose([Validators.required, Validators.maxLength(100)])],
            'phoneMobile':  [this.accountData.phoneMobile, Validators.compose([Validators.required, Validators.maxLength(100), NumberValidator.isNumber])],
        });
    }

    dismiss(updated:boolean = false) {
        let data = { update: updated };
        this.viewCtrl.dismiss(data);
    }

    submit() {
        console.info('modal edit phone');
        if(!this.editForm.valid) {
            this.showError = true;
            return;
        }
        this.showError = false;
        this.accountData.phonePrefix = this.editForm.value.phonePrefix;
        this.accountData.phoneMobile = this.editForm.value.phoneMobile;
        this.accountSrv.updateProfileData(this.accountData)
            .then(() => {
                console.log('success');
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
