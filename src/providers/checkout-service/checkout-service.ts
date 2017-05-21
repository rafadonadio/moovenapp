import { DateService } from '../date-service/date-service';
import { Injectable } from '@angular/core';

@Injectable()
export class CheckoutService {

    constructor(private dateSrv: DateService) {}

    generateTokenDataFromForm(formValues:any) {
        return {
            cardNumber: formValues.cardNumber,
            securityCode: formValues.securityCode,
            cardExpirationMonth: this.dateSrv.getMonthStr(formValues.cardExpiration),
            cardExpirationYear: this.dateSrv.getYearStr(formValues.cardExpiration),
            cardholderName: formValues.cardHolderName, // card< h OR H >olderName ???
            docType: formValues.docType,
            docNumber: formValues.docNumber,
            paymentMethodId: formValues.paymentMethodId
        }
    }

    getPaymentResultState(checkoutResponse) {
        let state = {
            title: '',
            message: '',
            setSendingPaid: false,
            setSendingEnabled: false
        }
        // no response, show error and die
        if (!checkoutResponse.responseSuccess) {
            state.title = 'Ocurrió un Error'
            state.message = `El pago no pudo procesarse, por favor intentalo de nuevo. (${checkoutResponse.responseCode})`;
        }
        // payment not completed, show error msg/code and die
        if (!checkoutResponse.paymentCompleted) {
            state.title = 'Pago incompleto';
            state.message = checkoutResponse.paymentMessage;
        }
        // payment completed  and rejected, show error and die
        if (checkoutResponse.paymentCompleted 
            && !checkoutResponse.paymentSuccess) {
            state.title = 'Pago rechazado';
            state.message = checkoutResponse.paymentMessage;
        }
        // payment succesfull, show if pending
        if (checkoutResponse.paymentCompleted
            && checkoutResponse.paymentSuccess 
            && checkoutResponse.paymentStatusCode == 'in_process') {
            state.title = 'Pago en Proceso';
            state.message = checkoutResponse.paymentMessage;
            state.setSendingPaid = true;
        }
        // payment succesfull, show if acredited
        if (checkoutResponse.paymentCompleted
            && checkoutResponse.paymentSuccess 
            && checkoutResponse.paymentStatusCode == 'approved') {
            state.title = 'Recibimos tu Pago';
            state.message = checkoutResponse.paymentMessage;
            state.setSendingPaid = true;
            state.setSendingEnabled = true;
        }        
        return state;
    }




}
