import { UsersService } from '../../providers/users-service/users-service';
import { SendingRequest } from '../../models/sending-model';
import { CardTokenData, PrepaymentData } from '../../providers/payment-gateways/mercadopago-model';
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

    fbuser:firebase.User;
    sending: SendingRequest;
    // form
    chForm:FormGroup;
    // inputs
    docType:string = "DNI";
    paymentMethodId:string = '';
    cardExpiration:string;
    // flags
    invalidCardNumber:boolean = false;
    showRequired:boolean;
    // helpers
    cardThumbnail:string;
    paymentGuess:any;
    // MercadoPago tokenData
    tokenData:CardTokenData;
    
    // aux
    dates = {
        // current datetime
        current: {
            timestamp: 0,
            standard: '', // YYYY-MM-DD
        },
        // current datetime plus 20 years 
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
        private dateSrv: DateService,
        private userSrv: UsersService) {}

    ngOnInit() {
        this.fbuser = this.userSrv.getUser();
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
            'paymentMethodId': ['', [Validators.required]],                        
        });
        this.setGenericCreditCardImage();
        this.showRequired=false;
    }

    guessPaymentMethod(event:any) {
        // reset invalid flag
        this.invalidCardNumber = false;
        this.setGenericCreditCardImage();
        console.log('numberInserted > ', this.chForm.value.cardNumber);
        if(this.chForm.controls['cardNumber'].valid && this.chForm.value.cardNumber.length > 5) {
            this.paySrv.guessPaymentTypeMP(this.chForm.value.cardNumber)
                .then((result:any) => {
                    console.log('guess > ok ', result);
                    if(result._response_status==200){
                        this.setPaymentGuess(result);
                    }else{
                        this.invalidCardNumber=true;
                    }
                })
                .catch((error) => {
                    console.error('guess > error ', error);
                });
        }else{
            console.log('numberInserted: cardNumber invalid OR length<=5');
        }
    }

    /**
     *  Method: runCheckout() > PAYMENT PROCESS STEPS
     *  1. VERIFY: if form is valid, proceed or prompt error
     *  2. TOKEN-DATA: generate Token Data (with form data) to request Card Token
     *  3. CARD-TOKEN: create card token with MP API
     *  4. PREPAYMENT-DATA: generate Pre-Payment data, with token id from step 3
     *  5. PAY: do payment > send payment request to backend server (with MP SDK deployed)
     *  6. UPDATE-DB: update firebase DB with results
     *  7. PROMPT: show message with results to user
     */
    private runCheckout() {
        console.info('runCheckout > start'); 
        // 1. VERIFY
        if(!this.chForm.valid) {
            console.info('form invalid');
            this.showRequired=true;
            return null;
            //////
            // DIE
            //////
        }
        // 2. TOKEN-DATA
        console.info('form valid');
        this.setTokenData(this.chForm.value);  
        console.log(this.tokenData);          
        // Init steps
        let steps = {
            genCardToken: false,
            genPaymentData: false,
            doPayment: false,
            updateDb: false
        }
        // show loader
        let loader = this.loadingCtrl.create({
            content: 'Procesando pago ...',
        });
        loader.present();      
        // 3. CARD-TOKEN
        this.paySrv.createCardTokenMP(this.tokenData)
            .then((cardTokenResult) => {
                console.log('createCardTokenMP > ', cardTokenResult);
                let statusCode = cardTokenResult._response_status;
                if(statusCode!=200 && statusCode!=201){
                    let cause = cardTokenResult.cause;
                    let errorMsg:any = this.paySrv.getCardTokenErrorMsgMP(statusCode, cause);
                    // error, show
                    this.showCardTokenErrors(errorMsg.msg);
                }else{
                    // good, continue
                    steps.genCardToken = true;
                    // 4. PAYMENT-DATA
                    let prepaymentData = this.getPrepaymentData(cardTokenResult.id);
                    // 5: PAY
                    this.paySrv.checkoutMP(prepaymentData)
                        .subscribe(
                            result => {
                                // payment succesfull
                                console.log('checkoutMP, result');
                                this.processCheckoutResult(loader, true, result);
                            },
                            error => {
                                console.log('checkoutMP > error', error);
                                this.processCheckoutResult(loader, false, error);
                            }
                        );                            
                }
            })
            .catch((error) => {
                console.log('runCheckout > steps > ', error);
                loader.dismiss()
                    .then(() => {
                        let alertError = this.alertCtrl.create({
                            title: 'Error con el pago',
                            subTitle: 'Ocurrió un error al procesar el pago, por favor intenta nuevamente.',
                            buttons: [{
                                text: 'Cerrar',
                                role: 'cancel'
                            }]
                        });
                        // show
                        alertError.present();
                    });
            });        
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
     *  PAYMENT STEPS HELPERS
     */

     private processCheckoutResult(loader, result, data) {
        if(result){
            // 6. UPDATE DB
            // ..                
            // hide loader
            loader.dismiss()
                .then(() => {
                    this.presentToast();
                });
        }else{
            loader.dismiss()
                .then(() => {
                    let alertError = this.alertCtrl.create({
                        title: 'Pago no procesado',
                        subTitle: 'Ocurrió un error al procesar el pago, por favor intenta nuevamente mas tarde.',
                        buttons: [{ text: 'Cerrar', role: 'cancel' }]
                    });
                    // show
                    alertError.present();         
                });           
        }
     }

     private showCardTokenErrors(errorMsg:string) {
        let msg = 'Los datos ingresados no son válidos, por favor revisalos y vuelve a intentar.';
        if(errorMsg!=='') {
            msg+= ' (Posibles errores: ' + errorMsg + ')';
        }
        let alertError = this.alertCtrl.create({
            title: 'Datos inválidos',
            subTitle: msg,
            buttons: [{
                text: 'Cerrar',
                role: 'cancel'
            }]
        });
        alertError.present();
     }


     private getPrepaymentData(cardTokenId) {
         // send all collected data
         let prepaymentData:PrepaymentData = {
             transactionAmount: this.sending.price,
             cardToken: cardTokenId,
             description: 'Servicio Mooven #' + this.sending.publicId,
             paymentMethodId: this.chForm.controls['paymentMethodId'].value,
             payerEmail: this.fbuser.email
         }
         return prepaymentData;
     }


    /**
     *  CHECKOUT PREPARATION
     */

    private setPaymentGuess(result) {
        this.paymentGuess = result;
        this.paymentMethodId = result.id;
        // set credit card image
        this.cardThumbnail = result.thumbnail;
    }

    // Set token data to send to get Card Token
    private setTokenData(form:any) {
        this.tokenData = {
            cardNumber: form.cardNumber,
            securityCode: form.securityCode,
            cardExpirationMonth: this.dateSrv.getMonthStr(form.cardExpiration),
            cardExpirationYear: this.dateSrv.getYearStr(form.cardExpiration),
            cardholderName: form.cardHolderName, // card< h OR H >olderName ???
            docType: form.docType,
            docNumber: form.docNumber,
            paymentMethodId: form.paymentMethodId            
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
