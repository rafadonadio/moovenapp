import { MERCADOPAGO_REF, paymentMethod } from '../payment-gateways/mercadopago-model';
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

    guessPaymentMethod(input:string) {
        let self = this;
        let result:paymentMethod;
        return new Promise((resolve, reject) => {
        Mercadopago.getPaymentMethod({
                "bin": input
            }, function (status, response){
                if (status == 200) {
                    result = self.getPaymentMethodResponse(response);
                    resolve(result);
                }else{
                    reject(status);
                }
            });
        });
    }

    // get "formas de pago"
    getInstallment():Promise<any> {
        console.log('MP > getInstallment ..');
        // Hi MP
        return new Promise((resolve, reject) => {
            Mercadopago.getInstallments({
                "payment_method_id":"visa",
                "amount": 100
                }, function (status, response){
                    if (status == 200) {
                        resolve(response);
                    }else{
                        reject(status);
                    }
            });
        });
    }


    /**
     *  HELPERS
     */

    private init():void {
        Mercadopago.setPublishableKey(CFG.PUBLIC_KEY.SANDBOX.PUBLIC_KEY);
    }

    private getPaymentMethodResponse(response:any) {
        let result:paymentMethod = {
            id:'',
            payment_type_id:'',    
            name:'',
            thumbnail:'',
            secure_thumbnail:'',
            additional_info_needed:[],
            max_allowed_amount:0,
            min_allowed_amount:0,
            financial_institutions:[],    
            status:'',            
        }        
        for(let index in result) {
            if(response[0][index]!=='undefined') {
                result[index] = response[0][index];
            }
        }
        return result;
    }

}