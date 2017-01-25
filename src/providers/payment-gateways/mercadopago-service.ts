import { MERCADOPAGO_REF } from '../../models/payments-model';
import { Injectable } from '@angular/core';

declare var Mercadopago:any;

const CFG = MERCADOPAGO_REF;

@Injectable()
export class MercadopagoService {

    mpago:any;

    constructor() {
        Mercadopago.setPublishableKey(CFG.PUBLIC_KEY.SANDBOX.PUBLIC_KEY);    
    }

    getInstallment() {
        Mercadopago.getInstallments({
		"payment_method_id":"visa",
		"amount": 100
        }, function (status, response){
            console.log(response);
        });
    }


}