import { AuthService } from '../../providers/auth-service/auth-service';
import { Component, OnInit } from '@angular/core';
import { NavController, ViewController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { EmailValidator } from '../../validators/email.validator';

@Component({
    selector: 'modal-auth-reset-password',
    templateUrl: 'modal-auth-reset-password.html'
})
export class ModalAuthResetPasswordPage implements OnInit{

    editForm: FormGroup;
    email: AbstractControl;

    constructor(public navCtrl: NavController,
        public viewCtrl: ViewController,
        public formBuilder: FormBuilder,
        public alertCtrl: AlertController,
        public authSrv: AuthService) {

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
        this.authSrv.sendPasswordResetEmail(formValue.email)
            .then(() => {
                console.log('password reset > ok');
                let alert = this.alertCtrl.create({
                    title: 'Reseteo de clave iniciado',
                    message: 'Te hemos enviado un email con los pasos para resetear la clave, por favor revisa tu correo.',
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
            .catch((error:any) => {
                console.log('reset password error > ', error);
                this.editForm.get('email').setValue('');
                this.showAlert(error);
            });
    }


    /**
     *  PRIVATE
     */

    private showAlert(error:any): void {
        // init
        let title: string;
        let msg: string;
        // switch
        switch(error.code) {

            case 'auth/invalid-email':
                title = 'Dirección inválida';
                msg = 'La dirección de correo es inválida, ingrese una dirección de correo válida y vuelva a intentar.';
                this.presentAlert(title, msg);
                break;

            case 'auth/user-not-found':
                title = 'Solicitud recibida';
                msg = 'Si la dirección ingresada corresponde a un usuario registrado, se enviará un correo con los datos para la recuperación de contraseña.';
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
