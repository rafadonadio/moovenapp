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
// SANDBOX
const MERCADOPAGO_KEY = CFG.PUBLIC_KEY.SANDBOX.PUBLIC_KEY;
// DEV URL
//const SERVER_PAYMENT_URL = CFG.BACKEND_SERVER.LOCAL_URL.PAYMENT;
const SERVER_PAYMENT_URL = CFG.BACKEND_SERVER.DEV_URL.PAYMENT;

@Injectable()
export class MercadopagoService {

    mpago:any;

    constructor(private http:Http) {
        this.init();
    }

    // generate payment with the corresponding data
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
                //console.log('guessPaymentMethod > status ', status);
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
        return new Promise((resolve, reject) => {
            //console.log('MP>>', Mercadopago);
            Mercadopago.createToken(form, function(status, response) {
                //console.log('createCardToken > status ', status, response);
                if(status==200 || status==201 || status==400) {
                    let result = self.getCardTokenResponse(status, response);
                    resolve(result);
                }else{
                    reject(status);
                }                
            });
        });          
    }

    // get error message text for card token error, given by API
    getCardTokenErrorMsg(statusCode:number, cause:Array<any>):string {
        return this.groupCardTokenApiErrorsMsgByStatuscode(statusCode, cause);
    }

    clearSession() {
        return Mercadopago.clearSession();
    }


    /**
     *  HELPERS
     */

    private init():void {
        Mercadopago.setPublishableKey(MERCADOPAGO_KEY);
    }


    /**
     *   CREATE PAYMENT
     */

    private generatePaymentData(preData:PrepaymentData) {
        //console.log('preData > ', preData);
        let data:PaymentData = {
            transactionAmount:preData.transactionAmount,
            token: preData.cardToken,
            description:preData.description,
            installments: 1, // will use 1 by default (?)
            paymentMethodId: preData.paymentMethodId,
            payerEmail: preData.payerEmail,
            externalReference: preData.externalReference,
            suid: preData.suid,
            puid: preData.puid,
            uid: preData.uid
        }
        //console.log('paymentData > ', data);
        return data;
    }

    // send payment data to server
    // expect response with transaction result
    private runServerPayment(data:PaymentData):Observable<any> {
        // set header
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        let tokendata = 'transactionAmount='+data.transactionAmount
                        +'&token='+data.token
                        +'&description='+data.description
                        +'&installments='+data.installments
                        +'&paymentMethodId='+data.paymentMethodId
                        +'&payerEmail='+data.payerEmail
                        +'&externalReference='+data.externalReference
                        +'&suid='+data.suid
                        +'&puid='+data.puid
                        +'&uid='+data.uid;
        return this.http.post(SERVER_PAYMENT_URL, tokendata, {headers:headers})
                    .map((response) => {
                        //console.log('payment response', response);          
                        let paymentResult = this.extractPaymentResult(response);
                        console.log('paymentResult', paymentResult);  
                        return paymentResult;
                    })
                    .catch(this.handleHttpError);
    }

    /**
     *  PROCESS RESPONSES
     */

    private extractPaymentResult(res) {
        let body = res.json();
        return body.payment_result || { };
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


    /**
     *  RESPONSES HELPERS
     */

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

    // private extractData(res: Response) {
    //     let body = res.json();
    //     return body || { };
    // }

    /**
     *  API ERROR CODES
     */

    // group error messages given by CardToken API
    private groupCardTokenApiErrorsMsgByStatuscode(statusCode:number, cause:Array<any>):any {       
        let result = {
            errorCodes: [],
            msg: '',
        };
        for(let index in cause) {
            let code = cause[index].code;
            result.errorCodes.push(code);
            result.msg+= this.getMessageForCardTokenErrorCode(code) + '. ';
        }
        //console.log('groupCardTokenApiErrorsMsgByStatuscode > result', result);
        return result;
    }

    // set error message given error code bt CardToken API   
    // https://www.mercadopago.com.ar/developers/es/api-docs/custom-checkout/card-tokens/
    private getMessageForCardTokenErrorCode(errorcode:string):string {
        let msg:string = '';
        switch(errorcode) {
            case '301':
                msg = 'Fecha expiración inválida';
                break;
            case '316':
                msg = 'Nombre del Titular de tarjeta inválido';
                break;                
            case '324':
                msg = 'Número de DNI inválido';
                break;  
            case 'E202':
                msg = 'Número de tarjeta inválido';
                break;
            case 'E203':
                msg = 'Código de seguridad inválido';
                break;            
            case 'E301':
                msg = 'Error en el Número de Tarjeta';
                break;                
            case 'E302':
                msg = 'Revisa el código de seguridad';
                break;
            case 'E305':
                msg = 'Cantidad de caracteres del DNI inválido';
                break;    
            default:
                msg = `No hay ayuda disponible (${errorcode})`;            
        }
        return msg;
    }

}