import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { EmailValidator } from '../../shared/validators/email.validator';
import { UsersService } from '../../providers/users-service/users-service';

@Component({
    templateUrl: 'modal-auth-reset-password.html',
    directives: [FORM_DIRECTIVES]
})
export class ModalAuthResetPasswordPage implements OnInit{

    editForm: FormGroup;
    email: AbstractControl;

    constructor(private navCtrl: NavController,
        private viewCtrl: ViewController,
        private formBuilder: FormBuilder,
        private users: UsersService,
        private alertCtrl: AlertController) {

    }

    ngOnInit() {
        // form init
        this.editForm = this.formBuilder.group({
            'email':  ['', Validators.compose([Validators.required, EmailValidator.isValid, Validators.maxLength(100)])],
        });
        this.email = this.editForm.controls['email'];
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    submit(formValue: any) {
        console.log('reset password > ' + formValue.email + ' > init ...');
        this.users.resetPassword(formValue.email)
            .then(() => {
                console.log('password reset > ok');
                let alert = this.alertCtrl.create({
                    title: 'Reseteo de clave iniciado',
                    message: 'Te hemos enviado un email con los pasos para resetear la clave. por favor revisa tu correo.',
                    buttons: [
                        {
                            text: 'Cerrar',
                            role: 'cancel',
                            handler: () => {
                                this.dismiss();
                            }
                        }
                    ]
                });
                alert.present();
            })
            .catch((error) => {
                console.log('reset password error > ', error.code);
                this.showAlert(error.code);
            });
    }


    /**
     *  PRIVATE
     */

    private showAlert(code: string): void {
        // init
        let title: string;
        let msg: string;
        // switch
        switch(code) {

            case 'auth/invalid-email':
                title = 'Dirección inválida';
                msg = 'La dirección de correo es inválida, ingrese una dirección válida y vuelva a intentar.';
                this.presentAlert(title, msg);
                break;

            case 'auth/user-not-found':
                title = 'No encontrado';
                msg = 'Es posible que la dirección ingresada no corresponda con un usuario registrado, vuelve a intentarlo.';
                this.presentAlert(title, msg);
                break;

            default:
                title = 'Error';
                msg = 'Ocurrió un error inesperado, vuelve a intentarlo.';
                this.presentAlert(title, msg);
        }
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
