import {
    CardTokenData,
    MERCADOPAGO_REF,
    PaymentData,
    paymentMethod,
    PrepaymentData
} from '../payment-gateways/mercadopago-model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers, Response } from '@angular/http';

declare var Mercadopago:any;

const CFG = MERCADOPAGO_REF;

@Injectable()
export class MercadopagoService {

    mpago:any;

    constructor(private http:Http) {
        this.init();
    }

    // generate payment with the corresponding amount 
    // from backend servers (PHP SDK)
    // https://www.mercadopago.com.ar/developers/en/api-docs/custom-checkout/create-payments/
    checkout(prepaymentData:PrepaymentData):Observable<any> {
        let paymentData = this.generatePaymentData(prepaymentData);
            return this.runServerPayment(paymentData);
    }

    // Retrieves information about available payment methods
    //https://www.mercadopago.com.ar/developers/en/api-docs/custom-checkout/payment-methods/
    guessPaymentMethod(input:string) {
        let self = this;
        let result:paymentMethod;
        return new Promise((resolve, reject) => {
        Mercadopago.getPaymentMethod({
                "bin": input
            }, function (status, response){
                console.log('guessPaymentMethod > status ', status);
                if(status==200 || status==400) {
                    result = self.getPaymentMethodResponse(status, response);
                    resolve(result);
                }else{
                    reject(status);
                }
            });
        });
    }

    // create card token for payment
    // https://www.mercadopago.com.ar/developers/en/api-docs/custom-checkout/card-tokens/
    createCardToken(form:CardTokenData):Promise<any> {
        let self = this;
        let result:any;
        return new Promise((resolve, reject) => {
            Mercadopago.createToken(form, function(status, response) {
                console.log('createCardToken > status ', status, response);
                if(status==200 || status==201 || status==400) {
                    let result = self.getCardTokenResponse(status, response);
                    resolve(result);
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

    // send payament data to our server
    // expect response with transaction result
    private runServerPayment(data:PaymentData):Observable<any> {
        // set header
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        let tokendata = '';
        return this.http.post('', tokendata, {headers:headers})
                    .map((response: Response) => {
                        return true;
                    })
                    .catch(this.handleHttpError);
    }

    private generatePaymentData(preData:PrepaymentData) {
        let data:PaymentData = {
            transactionAmount:0,
            token: preData.cardToken,
            description:'',
            installments: 1, // will use 1 by default
            paymentMethodId: '',
            payer: {
                email: '',
            }
        }
        return data;
    }

    private getPaymentMethodResponse(status:number, response:any) {
        let result:paymentMethod = {
            id:'',
            name:'',
            payment_type_id:'',    
            status:'',
            secure_thumbnail:'',            
            thumbnail:'',
            deferred_capture:'',
            additional_info_needed:[],
            min_allowed_amount:0,            
            max_allowed_amount:0,
            accreditation_time:0,
            financial_institutions:[],    
            _response_status: 0,
            _error:'',     
            _message:''       
        }        
        switch(status) {
            case 200:
                for(let index in result) {
                    if(response[0][index]!=='undefined') {
                        result[index] = response[0][index];
                    }
                }
                break;
            case 400:
                for(let index in result) {
                    if(response[index]!=='undefined') {
                        result[index] = response[index];
                    }
                }
                break;                
        }
        // set status
        result._response_status = status;
        return result;
    }


    private getCardTokenResponse(status:number, response:any) {
        let result:any = {
            id:'',
            public_key:'',
            cause: [],
            error:'',     
            message:'',
            _response_status: 0
        }        
        switch(status) {
            case 200:
            case 201:
                for(let index in result) {
                    if(response[index]!=='undefined') {
                        result[index] = response[index];
                    }
                }
                break;
            // all errors
            default:
                result.cause = response.cause;
                result.error = response.error;
                result.message = response.message;
                break;                
        }
        // set status
        result._response_status = status;
        return result;
    }

    private handleHttpError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let err = {
            msg:'',
            status: 0,
            body:''
        };
        if (error instanceof Response) {
            err.body = error.text();
            err.status = error.status
            err.msg = `Error ${err.status}: ${error.statusText || ''}. ${err.body}`;
        } else {
            err.msg = error.message ? error.message : error.toString();
        }
        return Observable.throw(err);
    }

}