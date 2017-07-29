import { AuthService } from '../../providers/auth-service/auth-service';
import { HomePage } from '../home/home';
import { Component } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { EmailValidator } from '../../validators/email.validator';
import { ModalAuthResetPasswordPage } from '../modal-auth-reset-password/modal-auth-reset-password';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {

    signinForm: FormGroup;
    email: AbstractControl;
    password: AbstractControl;
    loader:any;

    constructor(private navCtrl: NavController,
        private formBuilder: FormBuilder,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private modalCtrl: ModalController,
        private authSrv: AuthService) {
    }

    ngOnInit() {
        this.signinForm = this.formBuilder.group({
            'email':  ['', Validators.compose([Validators.required, EmailValidator.isValid])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        });
        this.email = this.signinForm.controls['email'];
        this.password = this.signinForm.controls['password'];
    }

    /**
     * Signup Form Submit
     */
    login(form: any):void {
        if(!this.signinForm.valid) {
            console.log('login, form invalid');
        }else{
            // loader
            this.loader = this.loadingCtrl.create({
                content: 'Iniciando sesión ...'
            });
            this.loader.present();  
            // signin
            this.authSrv.signInWithEmailAndPassword(form.email, form.password)
                .then((user) => {
                    console.log('login success');
                    // close loader
                    this.loader.dismiss()
                        .then(() => {
                            // go to HomePage, is triggered bu authState
                        })
                        .catch((error) => console.log('error', error)); 
                })
                .catch((error:any) => {
                    console.log('login error', error);
                    this.loader.dismiss()
                        .then(() => {
                            this.presentErrorAlert(error);
                        })
                        .catch((error) => console.log('error', error)); 
                });
        }
    }

    presentModalPasswordReset() {
        let modal = this.modalCtrl.create(ModalAuthResetPasswordPage);
        modal.present();
    }

    /**
     *  PRIVATE METHODS
     */
    
    // error:{code:string, message:string}
    private presentErrorAlert(error:any):void {
        // set strings
        var msg: string;
        var context: string;
        switch(error.code){
            case 'auth/account-exists-with-different-credential':
                context = 'Atención';
                msg = 'Prueba ingresar con tu cuenta de Google o Facebook.';
                break;
            case 'auth/invalid-credential':
                context = 'Error';
                msg = 'Esta cuenta tiene las credenciales inválidas o vencidas.';
                break;
            case 'auth/operation-not-allowed':
                context = 'Error';
                msg = 'Esta operación no es válida';
                break;
            case 'auth/user-disabled':
                context = 'Cuenta inhabilitada';
                msg = 'Esta cuenta se encuentra inhabilitada';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                context = 'Datos incorrectos';
                msg = 'La combinación de dirección de correo y contraseña no coincide con ninguna cuenta, vuelve a intentarlo';
                break;
            default:
                context = 'Error';
                msg = 'Un error inesperado ha ocurrido, vuelve a intentarlo';
        }
        // create alert
        let alertError = this.alertCtrl.create({
            title: context,
            subTitle: msg,
            buttons: [{
                text: 'Cerrar',
                role: 'cancel'
            }]
        });
        // show
        alertError.present();
    }

}
