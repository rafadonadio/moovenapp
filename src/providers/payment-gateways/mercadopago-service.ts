import { MERCADOPAGO_REF } from '../payment-gateways/mercadopago-model';
import { Injectable } from '@angular/core';

declare var Mercadopago:any;

const CFG = MERCADOPAGO_REF;

@Injectable()
export class MercadopagoService {

    mpago:any;

    constructor() {
        this.init();
    }

    createPayment() {
        return new Promise((resolve, reject) => {
            this.getInstallment()
                .then((result) => {
                    console.log(result);
                    resolve(result);
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    }




    /**
     *  HELPERS
     */

    private init() {
        Mercadopago.setPublishableKey(CFG.PUBLIC_KEY.SANDBOX.PUBLIC_KEY);
    }

    // get "formas de pago"
    private getInstallment():Promise<any> {
        console.log('MP > getInstallment ..');
        // Hi MP
        return new Promise((resolve, reject) => {
            Mercadopago.getInstallments({
                "payment_method_id":"visa",
                "amount": 100
                }, function (status, response){
                    console.log(response);
                    resolve(response);
            });
        });
    }


}