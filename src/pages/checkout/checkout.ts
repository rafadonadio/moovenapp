import { CardTokenData } from '../../providers/payment-gateways/mercadopago-model';
import { DateService } from '../../providers/date-service/date-service';
import { AlertController } from 'ionic-angular/components/alert/alert';
import { ToastController } from 'ionic-angular/components/toast/toast';
import { LoadingController } from 'ionic-angular/components/loading/loading';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '../../validators/number.validator';

import { SendingPaymentService } from '../../providers/sending-service/sending-payment-service';

import { SendingsPage } from '../sendings/sendings';

const CC_IMG = 'assets/img/credit-card-sm.png';

@Component({
    selector: 'page-checkout',
    templateUrl: 'checkout.html'
})
export class CheckoutPage implements OnInit {

    chForm:FormGroup;
    sending: any;
    docType:string = "DNI";
    invalidCardNumber:boolean = false;
    cardThumbnail:string;
    showRequired:boolean;
    cardExpiration:string;

    // MercadoPago tokenData
    tokenData:CardTokenData;
    
    // aux
    dates = {
        current: {
            timestamp: 0,
            standard: '', // YYYY-MM-DD
        },
        currentplus20: {
            timestamp: 0,
            standard: '', // YYYY-MM-DD
        }
    };

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        public paySrv: SendingPaymentService,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        private fb: FormBuilder,
        private dateSrv: DateService) {}

    ngOnInit() {
        this.setCurrentDates();
        this.setDefaultDates();
        // get sending data
        this.sending = this.navParams.get('sending'); 
        // form
        this.chForm = this.fb.group({
            'cardNumber': ['', [Validators.required, Validators.maxLength(16), NumberValidator.isNumber]],
            'securityCode': ['', [Validators.required, Validators.maxLength(4), NumberValidator.isNumber]],           
            'cardExpiration': ['', [Validators.required]],   
            'cardHolderName': ['', [Validators.required]],            
            'docNumber': ['', [Validators.required, NumberValidator.isNumber]],
            'docType': ['', [Validators.required]],            
        });
        this.setGenericCreditCardImage();
        this.showRequired=false;
    }

    numberInserted(event:any) {
        // reset invalid flag
        this.invalidCardNumber = false;
        this.setGenericCreditCardImage();
        console.log('numberInserted > ', this.chForm.value.cardNumber);
        if(this.chForm.controls['cardNumber'].valid && this.chForm.value.cardNumber.length > 5) {
            this.paySrv.guessPaymentTypeMP(this.chForm.value.cardNumber)
                .then((result:any) => {
                    console.log('guess > ok ', result);
                    if(result._response_status==200){
                        this.cardThumbnail = result.thumbnail;
                    }else{
                        this.invalidCardNumber=true;
                    }
                })
                .catch((error) => {
                    console.error('guess > error ', error);
                });
        }else{
            console.log('numberInserted > !if');
        }
    }

    private runCheckout() {
        console.info('runCheckout > start', this.chForm.value); 
        if(!this.chForm.valid) {
            console.info('form invalid');
            this.showRequired=true;
        }else{
            console.info('form valid');
            this.setTokenData(this.chForm.value);  
            console.log(this.tokenData);          
        }
        // loader effect
        // let loader = this.loadingCtrl.create({
        //     content: 'procesando pago ...',
        // });
        // loader.present();
        // // pay
        // this.paySrv.checkout()
        //     .then((result) => {
        //         console.log('payment ok', result);
        //         loader.dismiss()
        //             .then(() => {
        //                 //this.sendingPayed = true;
        //                 //this.navCtrl.setRoot(SendingsPage);
        //                 this.presentToast();
        //             });
        //     })
        //     .catch((error) => {
        //         console.log('f4 > payment sending > error', error);
        //         loader.dismiss()
        //             .then(() => {
        //                 let alertError = this.alertCtrl.create({
        //                     title: 'Error con el pago',
        //                     subTitle: 'Ocurrió un error al procesar el pago, por favor intenta nuevamente.',
        //                     buttons: [{
        //                         text: 'Cerrar',
        //                         role: 'cancel'
        //                     }]
        //                 });
        //                 // show
        //                 alertError.present();
        //             });
        //     });        
    }

    goToSendings() {
        let alert = this.alertCtrl.create({
            title: 'Pago incompleto',
            message: 'El servicio queda habilitado al confirmarse el pago. Puedes finalizar el pago hasta una hora antes del horario establecido para el retiro.',
            buttons: [
                {
                    text: 'Continuar con el Pago',
                    role: 'cancel',
                    handler: () => {
                        console.log('checkout > cancel exit');

                    }
                },
                {
                    text: 'Volver al listado',
                    handler: () => {
                        console.log('checkout, exit');
                        this.navCtrl.setRoot(SendingsPage);
                    }
                }
            ]
        });
        alert.present();
    } 

    private presentToast() {
        let toast = this.toastCtrl.create({
            message: 'El pago fue procesado correctamente',
            duration: 3000,
            position: 'bottom'
        });

        toast.onDidDismiss(() => {
            console.log('f4 > toast > dismissed');
        });

        toast.present();
    }

    /**
     *  CHECKOUT PREPARATION
     */

    private setTokenData(form:any) {
        this.tokenData = {
            cardNumber: form.cardNumber,
            securityCode: form.securityCode,
            cardExpirationMonth: this.dateSrv.getMonthStr(form.cardExpiration),
            cardExpirationYear: this.dateSrv.getYearStr(form.cardExpiration),
            cardholderName: form.cardHolderName, // card< h OR H >olderName ???
            docType: form.docType,
            docNumber: form.docNumber            
        }
    }

    /**
     *  IMAGES
     */

    private setGenericCreditCardImage() {
        this.cardThumbnail = CC_IMG;
    }

    /**
     *  DATES
     */

    private setCurrentDates():void {
        let timestamp = this.dateSrv.getUnixTimestamp();
        this.dates.current.timestamp = timestamp;
        this.dates.current.standard = this.dateSrv.readISO8601FromTimestamp(timestamp);
        this.dates.currentplus20.timestamp = this.dateSrv.addTsYears(timestamp, 20);     
        this.dates.currentplus20.standard = this.dateSrv.readISO8601FromTimestamp(this.dates.currentplus20.timestamp);               
        console.log('setCurrentDates', this.dates);
    }

    private setDefaultDates():void {
        this.cardExpiration = this.dates.current.standard;
    }
}
