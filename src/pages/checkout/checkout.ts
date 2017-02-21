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

    fbuser: firebase.User;
    sending: SendingRequest;
    // form
    chForm: FormGroup;
    // inputs
    docType: string = "DNI";
    paymentMethodId: string = '';
    cardExpiration: string;
    // flags
    invalidCardNumber: boolean = false;
    showRequired: boolean;
    // helpers
    cardThumbnail: string;
    paymentGuess: any;
    // MercadoPago tokenData
    tokenData: CardTokenData;

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
        private userSrv: UsersService) { }

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
        this.showRequired = false;
    }

    guessPaymentMethod(event: any) {
        // reset invalid flag
        this.invalidCardNumber = false;
        this.setGenericCreditCardImage();
        console.log('numberInserted > ', this.chForm.value.cardNumber);
        if (this.chForm.controls['cardNumber'].valid && this.chForm.value.cardNumber.length > 5) {
            this.paySrv.guessPaymentTypeMP(this.chForm.value.cardNumber)
                .then((result: any) => {
                    console.log('guess > ok ', result);
                    if (result._response_status == 200) {
                        this.setPaymentGuess(result);
                    } else {
                        this.invalidCardNumber = true;
                    }
                })
                .catch((error) => {
                    console.error('guess > error ', error);
                });
        } else {
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
        if (!this.chForm.valid) {
            console.info('form invalid');
            this.showRequired = true;
            return null;
            ///// DIE /////
        }
        // 2. TOKEN-DATA
        console.info('form valid');
        this.setTokenData(this.chForm.value);
        console.log('tokenData >', this.tokenData);
        // Init steps
        let steps = {
            genCardToken: false,
            genPaymentData: false,
            doPayment: false,
            updateDb: false
        }
        // init loader
        let loader = this.loadingCtrl.create({ content: 'Procesando pago ...' });
        // 3. CARD-TOKEN
        this.paySrv.createCardTokenMP(this.tokenData)
            .then((cardTokenResult) => {
                console.log('createCardTokenMP > ', cardTokenResult);
                let statusCode = cardTokenResult._response_status;
                if (statusCode != 200 && statusCode != 201) {
                    let cause = cardTokenResult.cause;
                    let errorMsg: any = this.paySrv.getCardTokenErrorMsgMP(statusCode, cause);
                    // error, show
                    this.showCardTokenErrors(errorMsg.msg);
                } else {
                    // good, continue
                    steps.genCardToken = true;
                    // show loader
                    loader.present();
                    // 4. PAYMENT-DATA               
                    let prepaymentData = this.getPrepaymentData(cardTokenResult.id);
                    // 5: CREATE PAYMENT
                    this.paySrv.checkoutMP(prepaymentData)
                        .subscribe(
                        result => {
                            // response success
                            console.log('checkoutMP, response success', result);
                            this.clearSessionMP();
                            loader.dismiss()
                                .then(() => {
                                    // 6. UPDATE DB
                                    this.saveCheckoutResult(result);
                                    // 7. PROMPT
                                    this.showAlertForCheckoutResult(result);
                                });
                        },
                        error => {
                            console.log('checkoutMP > response error', error);
                            this.clearSessionMP();
                            loader.dismiss()
                                .then(() => {
                                    let alertError = this.alertCtrl.create({
                                        title: 'Ocurrió un Error',
                                        subTitle: `Lo sentimos, el pago no puede procesarse en este momento, por favor intenta nuevamente mas tarde. (statuscode: ${error.status})`,
                                        buttons: [{ text: 'Cerrar', role: 'cancel' }]
                                    });
                                    // show
                                    alertError.present();
                                });
                        }
                        );
                }
                this.tokenData = null;
                cardTokenResult = null;
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


    private showCheckoutAlert(title:string, msg:string) {
        let alertError = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: [{text:'Cerrar', role:'cancel'}]
        });
        alertError.present();        
    }

    /**
     *  PAYMENT STEPS HELPERS
     */

    private saveCheckoutResult(response:any) {
        this.paySrv.saveCheckoutToDB(response);
    }

    private showAlertForCheckoutResult(result) {
        if(!result.responseSuccess) {
            // no response, show error and die
            this.showCheckoutAlert(
                    'Ocurrió un Error', 
                    `El pago no pudo procesarse, por favor intentalo de nuevo. (${result.responseCode})`);
            return null;
            ///// DIE /////
        }
        if(!result.paymentCompleted) {
            // payment not completed, show error msg/code and die
            this.showCheckoutAlert(
                    'Pago incompleto', 
                    result.paymentMessage);
            return null;
            ///// DIE /////
        }
        if(result.paymentCompleted && !result.paymentSuccess) {
            // payment completed  and rejected, show error and die
            this.showCheckoutAlert(
                    'Pago rechazado', 
                    result.paymentMessage);
            return null;
            ///// DIE /////            
        }
        if(result.paymentCompleted && result.paymentSuccess) {
            // payment succesfull, show if acredited or pending
            this.showCheckoutAlert(
                    'Pago completado', 
                    result.paymentMessage);
            return null;
            ///// DIE /////             
        }
    }

    // reset session, because if you need to repeat a new payment
    // card token does not get created again. WTF??
    private clearSessionMP() {
        console.info('clearSessionMP()');
        this.paySrv.clearSessionMP();
    }

    private showCardTokenErrors(message: string) {
        let msgTxt = 'Los datos ingresados no son válidos, por favor revisalos y vuelve a intentar.';
        if (message !== '') {
            msgTxt += ' (Posibles errores: ' + message + ')';
        }
        let alertError = this.alertCtrl.create({
            title: 'Datos inválidos',
            subTitle: msgTxt,
            buttons: [{
                text: 'Cerrar',
                role: 'cancel'
            }]
        });
        alertError.present();
    }

    private getPrepaymentData(cardTokenId) {
        // send all collected data
        let prepaymentData: PrepaymentData = {
            transactionAmount: this.sending.price,
            cardToken: cardTokenId,
            description: 'Servicio Mooven #' + this.sending.publicId,
            paymentMethodId: this.chForm.controls['paymentMethodId'].value,
            payerEmail: this.fbuser.email,
            externalReference: this.sending.publicId
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
    private setTokenData(form: any) {
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

    private setCurrentDates(): void {
        let timestamp = this.dateSrv.getUnixTimestamp();
        this.dates.current.timestamp = timestamp;
        this.dates.current.standard = this.dateSrv.readISO8601FromTimestamp(timestamp);
        this.dates.currentplus20.timestamp = this.dateSrv.addTsYears(timestamp, 20);
        this.dates.currentplus20.standard = this.dateSrv.readISO8601FromTimestamp(this.dates.currentplus20.timestamp);
        console.log('setCurrentDates', this.dates);
    }

    private setDefaultDates(): void {
        this.cardExpiration = this.dates.current.standard;
    }
}
