import { SendingService } from '../../providers/sending-service/sending-service';
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
        public sendingSrv: SendingService,
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
     *  5. PAY: create payment > send payment request to backend server (with MP SDK deployed)
     *  6. UPDATE-DB AND PROMPT: update firebase DB with results > show message with results to user
     */
    runCheckout() {
        console.info('__[RC-0]__runCheckout');
        console.info('__[RC-1]__formValid');
        // 1. VERIFY
        let formValid = this.chForm.valid;
        console.log('__[RC-1]__', formValid);
        if (!formValid) {
            this.showRequired = true;
            return null; ///// DIE /////
        }
        // 2. TOKEN-DATA
        console.info('__[RC-2]__tokenData');
        this.setTokenData(this.chForm.value);
        console.log('__[RC-2]__', this.tokenData);
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
        console.info('__[RC-3]__cardToken');
        this.paySrv.createCardTokenMP(this.tokenData)
            .then((cardTokenResult) => {
                console.log('__[RC-3]__', cardTokenResult);
                let statusCode = cardTokenResult._response_status;
                console.log('__[RC-3]__', statusCode);
                if (statusCode != 200 && statusCode != 201) {
                    let cause = cardTokenResult.cause;
                    let errorMsg: any = this.paySrv.getCardTokenErrorMsgMP(statusCode, cause);
                    // error, show
                    this.showCardTokenErrors(errorMsg.msg);
                } else {
                    console.info('__[RC-4]__prepaymentData');
                    // good, continue
                    steps.genCardToken = true;
                    // show loader
                    loader.present();
                    // 4. PAYMENT-DATA               
                    let prepaymentData = this.getPrepaymentData(cardTokenResult.id);
                    console.log('__[RC-4]__', prepaymentData);
                    // 5: CREATE PAYMENT
                    console.info('__[RC-5]__pay');
                    let checkoutSuscription = this.paySrv.checkoutMP(prepaymentData).subscribe(
                        result => {
                            // response success
                            console.log('__[RC-5]__', result);
                            this.clearSessionMP();
                            checkoutSuscription.unsubscribe();
                            loader.dismiss()
                                .then(() => {
                                    // 6. UPDATE DB AND PROMPT
                                    console.info('__[RC-6]__saveAndPrompt');
                                    this.saveResultAndShowAlert(result);
                                })
                                .catch(error => console.error('dismiss error', error));
                        },
                        error => {
                            console.error('__[RC-5]__', error);
                            this.clearSessionMP();
                            checkoutSuscription.unsubscribe();
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


    private showCheckoutAlert(title:string, msg:string, goToSendings:boolean = false) {
        let alertError = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            buttons: [
                {
                    text:'Cerrar', 
                    handler: () => {
                        if(goToSendings) {
                            console.log('checkout > goToSendings');
                            this.navCtrl.setRoot(SendingsPage);
                        }else{
                            console.log('checkout > stay');
                        }
                    }
                }
            ]
        });
        alertError.present();        
    }

    /**
     *  PAYMENT STEPS HELPERS
     */

    private saveResultAndShowAlert(result) {
        let title:string = '';
        let message:string = '';
        let setSendingPaid = false;
        let setSendingEnabled = false;
        // no response, show error and die
        if(!result.responseSuccess) {
            title = 'Ocurrió un Error'
            message = `El pago no pudo procesarse, por favor intentalo de nuevo. (${result.responseCode})`;
        }
        // payment not completed, show error msg/code and die
        if(!result.paymentCompleted) {
            title = 'Pago incompleto';
            message = result.paymentMessage;
        }
        // payment completed  and rejected, show error and die
        if(result.paymentCompleted && !result.paymentSuccess) {
            title = 'Pago rechazado';
            message = result.paymentMessage;    
        }
        // payment succesfull, show if pending
        if(result.paymentCompleted 
            && result.paymentSuccess && result.paymentStatusCode=='in_process') {
            title = 'Pago en Proceso';
            message = result.paymentMessage;       
            setSendingPaid = true;  
        }
        // payment succesfull, show if acredited
        if(result.paymentCompleted 
            && result.paymentSuccess && result.paymentStatusCode=='approved') {
            title = 'Recibimos tu Pago';
            message = result.paymentMessage;     
            setSendingPaid = true;
            setSendingEnabled = true;    
        }
        // save to Db 
        let loader = this.loadingCtrl.create({ content: 'Finalizando ...' });
        loader.present();        
        this.paySrv.saveCheckoutResultToDB(this.fbuser.uid, this.sending.sendingId, result)
            .then((result) => {
                console.info('__[RC-6]__OK')
                if(setSendingPaid) {
                    console.log('__[RC-6]__PAID')
                    return this.sendingSrv.paid(this.sending.sendingId);
                }else{
                    return false;
                }
            })
            .then((result) => {
                if(result && setSendingEnabled) {
                    console.log('__[RC-6]__PAID_OK')
                    console.log('__[RC-6]__ENABLED')
                    return this.sendingSrv.enable(this.sending.sendingId);
                }else{
                    return false;
                }
            })
            .then((result) => {
                console.log('__[RC-6]__ENABLED_OK')
                loader.dismiss()
                    .then(() => {
                        this.showCheckoutAlert(title, message, true);
                    })
                    .catch(error => console.log('dismiss error', error));                               
            })
            .catch((error) => console.error('__[RC-6]__', error));
    }

    // reset session, because if you need to repeat a new payment
    // card token does not get created again. WTF??
    private clearSessionMP() {
        console.info('__[RC-5]__clearSessionMP()');
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
        //console.log('setCurrentDates', this.dates);
    }

    private setDefaultDates(): void {
        this.cardExpiration = this.dates.current.standard;
    }
}