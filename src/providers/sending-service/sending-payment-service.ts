import { Observable } from 'rxjs';
import { CardTokenData, PrepaymentData } from '../payment-gateways/mercadopago-model';
import { MercadopagoService } from '../payment-gateways/mercadopago-service';
import { Injectable } from '@angular/core';


@Injectable()
export class SendingPaymentService {

    constructor(public mpagoSrv: MercadopagoService) {}


    /**
     *  MERCADOPAGO API
     */

    checkoutMP(prepaymentData:PrepaymentData):Observable<any> {
        return this.mpagoSrv.checkout(prepaymentData);        
    }

    guessPaymentTypeMP(input:string): Promise<any> {
        return this.mpagoSrv.guessPaymentMethod(input);
    }

    createCardTokenMP(form:CardTokenData): Promise<any> {
        return this.mpagoSrv.createCardToken(form);    
    }

    getCardTokenErrorMsgMP(statusCode:number, cause:Array<any>):any {
        return this.mpagoSrv.getCardTokenErrorMsg(statusCode, cause);
    }

    clearSessionMP() {
        return this.mpagoSrv.clearSession();
    }

}

