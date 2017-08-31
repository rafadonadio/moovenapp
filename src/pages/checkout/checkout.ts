import { AuthService } from '../../providers/auth-service/auth-service';
import { Subscription } from 'rxjs/Rx';
import { UserAccount } from '../../models/user-model';
import { AccountService } from '../../providers/account-service/account-service';
import { CheckoutService } from '../../providers/checkout-service/checkout-service';
import { SendingRequest } from '../../models/sending-model';
import { CardTokenData, PrepaymentData } from '../../providers/payment-gateways/mercadopago-model';
import { DateService } from '../../providers/date-service/date-service';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NumberValidator } from '../../validators/number.validator';

import { SendingPaymentService } from '../../providers/sending-service/sending-payment-service';

import { SendingsTabsPage } from '../sendings-tabs/sendings-tabs';

const CC_IMG = 'assets/img/credit-card-sm.png';
const TIMEOUT = 300;

@Component({
    selector: 'page-checkout',
    templateUrl: 'checkout.html'
})
export class CheckoutPage implements OnInit {

    account: UserAccount;
    accountSubs: Subscription;
    sending: SendingRequest;
    chForm: FormGroup;
    // inputs
    docType: string = "DNI";
    paymentMethodId: string = '';
    cardExpiration: string;
    // flags
    invalidCardNumber: boolean = false;
    showRequired: boolean = false;
    // helpers
    cardThumbnail: string;
    paymentGuess: any;
    // MercadoPago tokenData
    tokenData: CardTokenData;
    cardToken: any;
    // aux
    dates:any;
    payLoader:any;
    // EXPIRATION
    // sending expiration
    secondsLeftToPay:number;
    humanizeLeftToPay:string;
    sendingExpired:boolean;
    checkoutTimer:any;
    checkoutTimeout:number;
    checkoutTimesup:boolean;
    paymentInProcess:boolean;   

    constructor(private navCtrl: NavController,
        private navParams: NavParams,
        private paySrv: SendingPaymentService,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private fb: FormBuilder,
        private dateSrv: DateService,
        private chkServ: CheckoutService,
        private accountSrv: AccountService,
        private authSrv: AuthService) { }

    ngOnInit() {
        this.setDates();
        this.setCurrentDates();
        this.setDefaultDates();
        this.initForm();
        this.setAccount();
        this.setGenericCreditCardImage();
        this.setSending();
        this.setSendingExpired();
        this.checkoutTimesup = false;
        this.paymentInProcess = false;
        if(this.sendingExpired) {
            console.log('sending expired, show alert and bye');
            this.chForm.disable();
            let alert = this.alertCtrl.create({
                title: 'Servicio vencido',
                message: 'El Servicio ha vencido porque la hora de Retiro ha pasado. Debes crear el Servicio nuevamente para proceder con el pago.',
                buttons: [{
                            text: 'Volver',
                            handler: () => {
                                console.log('checkout, exit');
                                this.navCtrl.setRoot(SendingsTabsPage);
                            }
                        }]
            });
            alert.present();            
            return;
        }
        // not expired, init timer
        this.initTimer()
    }

    ionViewWillLeave() {
        if(this.accountSubs) {
            this.accountSubs.unsubscribe();
        }
        this.stopTimer();
    }

    triggerPaymentGuess() {
        // reset invalid flag     
        this.resetCardNumberFlag();
        this.setGenericCreditCardImage();
        this.getPaymentMethod();
    }

    checkout() {
        this.runCheckout();
    }

    /**
     *  ###############
     *  PRIVATE METHODS
     *  ###############
     * 
     *  CHECKOUT
     *  POST PAYMENT
     *  PRE PAYMENT
     *  CARD TOKEN
     *  PAYMENT GUESS
     *  HELPERS
     *  NAVIGATION
     *  ONINIT
     */    

    /**
     *  CHECKOUT
     */

    /**
     *  Method: runCheckout() > PAYMENT PROCESS STEPS
     *  1. VALIDATE: if form is valid, proceed or prompt error
     *  2. TOKEN-DATA: generate Token Data (with form data) to request Card Token
     *  3. CARD-TOKEN: create card token with MP API
     *  4. PREPAYMENT-DATA: generate Pre-Payment data, with token id from step 3
     *  5. PAY: create payment > send payment request to backend server (with MP SDK deployed)
     *  6. PROCESS RESPONSE > getPaymentResultState
     *  7. SAVE: write paymentresult and paymentstate to Db
     *  8. SHOW MESSAGE
     */
    private runCheckout() {
        console.info('__[CKT-0]__runCheckout');              
        if(this.isFormValid()) {
            this.showPayLoader('Procesando pago ...');             
            this.setTokenData();
            this.createCardToken()
                .then((response) => this.validateCardTokenAndPay(response))
                .catch(error => this.showCardTokenFailedRequestError(error));
        }
    }

    /**
     *  POST PAYMENT
     */

    private processPaymentResponse(checkoutResponse:any) {        
        this.clearSessionMP();
        let paymentResultState = this.chkServ.getPaymentResultState(checkoutResponse);
        let closePage = checkoutResponse.paymentSuccess ? true : false;
        this.showCheckoutAlert(paymentResultState.title, paymentResultState.message, closePage);        
    }

    private showCheckoutAlert(title: string, msg: string, closePage: boolean = false) {
        let alert = this.alertCtrl.create({
            title: title,
            subTitle: msg,
            enableBackdropDismiss: false,
            buttons: [
                {
                    text: 'Cerrar',
                    handler: () => {
                        if (closePage) {
                            console.log('checkout > goToSendings');
                            this.navCtrl.setRoot(SendingsTabsPage);
                        } else {
                            console.log('checkout > stay');
                        }
                    }
                }
            ]
        });
        alert.present();       
    }

    // reset session, because if you need to repeat a new payment
    // card token does not get created again. WTF??
    private clearSessionMP() {
        console.info('__[CKT-5]__clearSessionMP()');
        this.paySrv.clearSessionMP();
    }

    /**
     *  PRE PAYMENT
     */

    private isFormValid() {
        console.info('__[CKT-1]__formValid');
        let valid = this.chForm.valid;
        if (!valid) {
            this.showRequired = true;
        }
        console.log('__[CKT-1]__', valid);
        return valid;
    }

    private createPayment() {           
        let prepaymentData = this.getPrepaymentData(this.cardToken.id);
        console.log('__[CKT-4]__', prepaymentData);
        console.info('__[CKT-5]__pay');
        let checkoutSuscription = this.paySrv.checkoutMP(prepaymentData)
                .subscribe(
                    checkoutResponse => {
                        console.log('__[CKT-5]__', checkoutResponse);
                        checkoutSuscription.unsubscribe();
                        this.payLoader.dismiss()
                            .then(() => {
                                this.processPaymentResponse(checkoutResponse);
                            })
                            .catch(error => console.error('dismiss error', error));
                    },
                    error => {
                        console.error('__[CKT-5]__', error);
                        this.clearSessionMP();
                        checkoutSuscription.unsubscribe();
                        this.payLoader.dismiss()
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

    private getPrepaymentData(cardTokenId) {
        console.info('__[CKT-4]__prepaymentData');
        // send all collected data
        let prepaymentData: PrepaymentData = {
            transactionAmount: this.sending.price,
            cardToken: cardTokenId,
            description: 'Servicio Mooven #' + this.sending.publicId,
            paymentMethodId: this.chForm.controls['paymentMethodId'].value,
            payerEmail: this.account.profile.data.email,
            externalReference: this.sending.publicId,
            suid: this.sending.sendingId,
            uid: this.authSrv.fbuser.uid
        }
        return prepaymentData;
    }

    /**
     *  CARD TOKEN
     */

    private createCardToken() {
        console.info('__[CKT-3]__cardToken');
        this.cardToken = null;
        return this.paySrv.createCardTokenMP(this.tokenData);
    }

    private validateCardTokenAndPay(response) {
        console.info('__[CKT-3]__', response);
        this.cardToken = response;
        if (this.cardTokenResponseHasError(response)) {
            this.payLoader.dismiss()
                    .then(() => {
                        this.showCardTokenResponseError();
                    })
                    .catch(error => console.log('dismiss error', error));
        } else {                
            this.createPayment();
        }
    }

    // Set token data to send to get Card Token
    private setTokenData() {
        console.info('__[CKT-2]__tokenData'); 
        this.tokenData = this.chkServ.generateTokenDataFromForm(this.chForm.value);
        console.log('__[CKT-2]__', this.tokenData);        
    }

    private cardTokenResponseHasError(response) {
        let statusCode = response._response_status;
        console.log('__[CKT-3]__', statusCode);   
        return statusCode != 200 && statusCode != 201;
    }

    // display if there was an error during the request
    private showCardTokenFailedRequestError(error) {
        console.log('runCheckout > steps > ', error);
        this.payLoader.dismiss()
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
    }

    private showCardTokenResponseError() {
        let statusCode = this.cardToken._response_status;
        let cause = this.cardToken.cause;
        let errorMsg: any = this.paySrv.getCardTokenErrorMsgMP(statusCode, cause);
        let message = errorMsg.msg;
        // set
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

   /**
     *  PAYMENT GUESS
     */

    private setPaymentGuess(result) {
        this.paymentGuess = result;
        this.paymentMethodId = result.id;
        // set credit card image
        this.cardThumbnail = result.thumbnail;
    }

    private getPaymentMethod() {
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
     *  HELPERS
     */

    private showPayLoader(text:string) {
        this.paymentInProcess = true;
        this.payLoader = this.loadingCtrl.create({ content: text });
        this.payLoader.present();    
        this.payLoader.onDidDismiss(() => {
            console.log('payloader dismissed');
        })
    }
    private dismissPayloader() {

    }

    private resetCardNumberFlag() {
        this.invalidCardNumber = false;        
    }

    /**
     *  NAVIGATION
     */

    goToSendings() {
        if(this.sendingExpired || this.checkoutTimesup) {
            this.navCtrl.setRoot(SendingsTabsPage);
            return;
        }
        let alert = this.alertCtrl.create({
            title: 'Pago incompleto',
            message: 'El Servicio queda habilitado al confirmarse el pago.',
            buttons: [
                {
                    text: 'Pagar ahora',
                    role: 'cancel',
                    handler: () => {
                        console.log('checkout > cancel exit');
                    }
                },
                {
                    text: 'Pagar luego',
                    handler: () => {
                        console.log('checkout, exit');
                        this.navCtrl.setRoot(SendingsTabsPage);
                    }
                }
            ]
        });
        alert.present();
    }


    /**
     *  ONINIT
     */

    private setAccount() {
        let obs = this.accountSrv.getObs(true);
        this.accountSubs = obs.subscribe((snap) => {
                            this.account = snap.val();
                            }, err => console.log('error', err));
    }

    private setSendingExpired() {
        let current = this.dateSrv.getCurrent();
        this.secondsLeftToPay = this.dateSrv.getDiff(current, this.sending.pickupTimeFrom);
        this.humanizeLeftToPay = this.dateSrv.humanizeSecondsDuration(this.secondsLeftToPay);
        this.sendingExpired = this.secondsLeftToPay>0 ? false : true;
        console.log('current time', current);
        console.log('pickupTimeFrom', this.sending.pickupTimeFrom);
        console.log('secondsLeftToPay', this.secondsLeftToPay);
        console.log('humanizeLeftToPay', this.humanizeLeftToPay);
        console.log('expired', this.sendingExpired);
    }

    private setSending() {
        this.sending = this.navParams.get('sending');
    }

    private initForm() {
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
    }

    private setDates() {
        this.dates = {
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
    }

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

    private setGenericCreditCardImage() {
        this.cardThumbnail = CC_IMG;
    }


    /**
     *  TIMER
     */

    private initTimer() {
        console.info('initTimer');
        // init 
        this.checkoutTimesup = false;
        let counter = 0;
        this.checkoutTimer = setInterval(() => {
            counter++;
            console.log(counter);
            this.checkoutTimeout = TIMEOUT - counter;
            if(this.checkoutTimeout<=0) {
                this.stopTimer();
                this.checkoutTimesup = true;
                console.log('tiempo concluido');
                this.presentTimerToast();
                this.chForm.disable();
            } 
        }, 1000);
        this.presentTimerToast();
    }

    private stopTimer() {
        console.info('timer stopped');
        clearInterval(this.checkoutTimer);
        
    }

    private presentTimerToast() {
        let secs = this.checkoutTimeout ? this.checkoutTimeout : TIMEOUT;
        let message;
        if(secs > 0 && this.checkoutTimesup==false) {
            message = 'Por favor procede con el pago';
        }else{
            message = 'El tiempo para confirmar el pago ha terminado';
        }
        let toast = this.toastCtrl.create({
            message: message,
            duration: 2000,
            position: 'bottom',
            showCloseButton: true,
            closeButtonText: 'Ok'
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    }  

}
