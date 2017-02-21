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
            console.log('MP>>', Mercadopago);
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
        Mercadopago.setPublishableKey(CFG.PUBLIC_KEY.SANDBOX.PUBLIC_KEY);
    }


    /**
     *   CREATE PAYMENT
     */

    private generatePaymentData(preData:PrepaymentData) {
        console.log('preData > ', preData);
        let data:PaymentData = {
            transactionAmount:preData.transactionAmount,
            token: preData.cardToken,
            description:preData.description,
            installments: 1, // will use 1 by default (?)
            paymentMethodId: preData.paymentMethodId,
            payerEmail: preData.payerEmail,
            externalReference: preData.externalReference
        }
        console.log('paymentData > ', data);
        return data;
    }

    // send payament data to our server
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
                        +'&externalReference='+data.externalReference;
        return this.http.post(CFG.BACKEND_SERVER.URL.PAYMENT, tokendata, {headers:headers})
                    .map((response: Response) => {
                        console.log('runServerPayment > response', response);                       
                        return this.getServerPaymentResponse(response);
                    })
                    .catch(this.handleHttpError);
    }

    /**
     *  PROCESS RESPONSES
     */

    private getServerPaymentResponse(response:any) {
        let result = { 
            responseSuccess: null,      // server response is 200?
            responseCode: 0,            // server response code
            statusCode: 0,              // MP Payment http status code
            paymentStatusCode: null,    // MP Payment status text code
            paymentStatusDetail: null,  // MP Payment status detail
            paymentMessage: null,       // human message for user
            paymentData: null,          // MP Payment OK server response
            errorData: null ,           // MP Payment Error server response
            data: null,                 // Server data response 
            paymentCompleted: null,     // flag, if payment is completed
            paymentSuccess: null,       // flas, if payment is not rejected     
        };
        // get all data
        result.data = this.extractData(response);
        // get http response code
        result.responseCode = response.status;
        // verify http response code is 200
        if(response && response.hasOwnProperty('status') && response.status == 200){
            result.responseSuccess = true;
            if(result.data._payment 
                 && result.data._payment.hasOwnProperty('status') 
                 && result.data._payment.status == 201) {
                 result.paymentData = result.data._payment.response;                         
                 result.statusCode = result.data._payment.status;
                 result.paymentStatusCode = result.data._payment.response.status; 
                 result.paymentStatusDetail = result.data._payment.response.status_detail;                              
                 result.paymentCompleted = true;  
                 result.paymentSuccess = result.paymentStatusCode!=='rejected' ? true : false;                 
                 result.paymentMessage = this.getMessageForServerPaymentCompleted(result.paymentStatusDetail, result.paymentSuccess);                  
            }else if(result.data._paymentError && result.data._paymentError.code == 400){
                 result.errorData = result.data._paymentError;
                 result.statusCode = result.data._paymentError.code;                          
                 result.paymentStatusCode = result.data._paymentError.parsed.code; 
                 result.paymentStatusDetail = result.data._paymentError.parsed.detail;
                 result.paymentMessage = this.getMessageForServerPaymentError(result.paymentStatusCode, result.paymentStatusDetail); 
                 result.paymentCompleted = false;
            }
        // not 200, get code if exist and set error     
        }else if(response){
            result.responseSuccess = false;
            result.responseCode = response.hasOwnProperty('status') ? response.status : 0;
        }
        return result;
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

    private extractData(res: Response) {
        let body = res.json();
        return body || { };
    }

    /**
     *  API ERROR CODES
     */

     // messages for payment with error, not completed
     private getMessageForServerPaymentError(paymentStatusCode:string, paymentStatusDetail:string) {
         let message = '';
         switch(paymentStatusCode) {
             case '2001':
                message = 'El pago no se procesó, se detectó un pago idéntico hace menos de 1 minuto.';
                break;
             case '4037':
                message = 'El pago no se procesó, el monto es inválido';
                break;
             case '3015':
             case '3016':
                message = 'El pago no se procesó, por favor revisa el nro de la tarjeta y vuelve a intentarlo.';
                break;
             default:
                message = `Ocurrió un error al intentar el pago (${paymentStatusCode}: "${paymentStatusDetail}").`;
            }
         return message;
     }

    // messages for payment completed: successfull or with errors 
    // https://www.mercadopago.com.ar/developers/en/solutions/payments/custom-checkout/response-handling#payment-ok
    private getMessageForServerPaymentCompleted(statusDetail:string, paymentSuccess:boolean) {
        let message = '';
        if(paymentSuccess==true){
            switch(statusDetail) {
                case 'accredited':
                    message = 'Tu pago fue acreditado correctamente, muchas gracias!';
                    break;
                case 'pending_contingency':
                    message = 'Estamos procesando tu pago, deberías recibir novedades en menos de 1 hora.';
                    break;
                case 'pending_review_manual':
                    message = 'Estamos procesando tu pago, deberías recibir novedades en menos de 2 días hábiles.';
                    break;                    
            }
        }else if(paymentSuccess==false){
            switch(statusDetail){
                case 'cc_rejected_bad_filled_card_number':
                case 'cc_rejected_bad_filled_date':
                case 'cc_rejected_bad_filled_security_code':
                    message = 'El pago no pudo procesarse, por favor revisa los datos ingresados y vuelve a intentarlo.';
                    break;  
                case 'cc_rejected_duplicated_payment':
                    message = 'Un pago ya fue realizado anteriormente por el mismo monto. Si debes repetirlo por favor utiliza otra tarjeta.';
                    break;  
                case 'cc_rejected_max_attempts':
                    message = 'El pago no pudo procesarse, has alcanzado el número máximo de intentos, utiliza otra tarjeta y vuelve a intentarlo.';
                    break;  
                case 'cc_rejected_blacklist':
                case 'cc_rejected_call_for_authorize':
                case 'cc_rejected_card_disabled':
                case 'cc_rejected_card_error':
                case 'cc_rejected_high_risk':
                case 'cc_rejected_insufficient_amount':
                case 'cc_rejected_invalid_installments':
                    message = 'El pago no fue autorizado por el emisor de la tarjeta, por favor comunicate con tu banco para volver a intentar';
                    break;  
                case 'cc_rejected_bad_filled_other':
                case 'cc_rejected_other_reason':
                    message = 'El pago no pudo procesarse, por favor utiliza otra tarjeta para volver a intentar.';
                    break;                                                                                  
            }
        }        
        return message;
    }

    // group error messages given by CardToken API
    private groupCardTokenApiErrorsMsgByStatuscode(statusCode:number, cause:Array<any>):any {       
        let result = {
            errorCodes: [],
            msg: '',
        };
        let msg:string;
        let errorCodes: Array<any> = [];
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