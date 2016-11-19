import { UserAccountProfile, UserProfileData } from '../../models/user-model';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, AlertController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { UsersService } from '../../providers/users-service/users-service';
import { EmailValidator } from '../../validators/email.validator';


@Component({
    selector: 'modal-user-edit-email',
    templateUrl: 'modal-user-edit-email.html'
})
export class ModalUserEditEmailPage implements OnInit {

    editForm: FormGroup;
    email: AbstractControl;
    profData: UserProfileData;
    changeInProcess: boolean;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public alertCtrl: AlertController,
        public users: UsersService,
        public formBuilder: FormBuilder,
        public params: NavParams) {
        this.profData = this.params.get('profData');
        this.changeInProcess = this.profData.emailOnChange;
    }

    ngOnInit() {
        // form init
        this.editForm = this.formBuilder.group({
            'email':  ['', Validators.compose([Validators.required, EmailValidator.isValid, Validators.maxLength(100)])],
        });
        this.email = this.editForm.controls['email'];
        this.email.markAsTouched();
    }

    submit(formValue: any) {
        console.log('email update > init ...');
        this.users.updateUserEmail(formValue.email)
            .then(() => {
                console.log('email updated!');
                let alert = this.alertCtrl.create({
                    title: 'Email modificado',
                    message: 'Hemos enviado un email a la nueva dirección con un link de confirmación para validar y finalizar el proceso de cambio.',
                    buttons: [
                        {
                            text: 'Cerrar',
                            role: 'cancel',
                            handler: data => {
                                this.dismiss(true);
                            }
                        }
                    ]
                });
                alert.present();

            })
            .catch((errorcode) => {
                console.log('email update failed', errorcode);
                this.showAlert(errorcode);
            });
    }

    dismiss(updated:boolean = false) {
        let data = { update: updated };
        this.viewCtrl.dismiss(data);
    }

    /**
     * PRIVATE
     */

    private showAlert(code) {
        // init
        let title: string;
        let msg: string;
        // switch
        switch(code) {

            case 'auth/invalid-email':
                title = 'Error';
                msg = 'La dirección de correo es inválida, ingrese una dirección válida y vuelva a intentar.';
                this.presentAlert(title, msg);
                break;

            case 'auth/email-already-in-use':
                title = 'Error';
                msg = 'Es posible que la dirección ingresada este en uso, ingrese otra dirección válida y vuelva a intentar.';
                this.presentAlert(title, msg);
                break;

            case 'auth/requires-recent-login':
                title = 'Se requiere reingresar';
                msg = 'Por razones de seguridad se requiere un login reciente para modificar la dirección de correo, por favor salga, vuelva a ingresar y reintente cambiar la dirección inmediatamente.';
                this.presentConfirm(title, msg);
                break;

            default:
                title = 'Error';
                msg = 'Ocurrió un error inesperado, vuelve a intentarlo.';
                this.presentAlert(title, msg);
        }
    }

    private presentConfirm(title: string, msg: string): void {
        let alert = this.alertCtrl.create({
            title: title,
            message: msg,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    handler: () => {
                        this.dismiss();
                    }
                },
                {
                    text: 'Reingresar',
                    handler: () => {
                        this.dismiss();
                        this.users.signOut();
                    }
                }
            ]
        });
        alert.present();
    }

    private presentAlert(title, msg) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: ['Cerrar']
        });
        alert.present();
    }
}
