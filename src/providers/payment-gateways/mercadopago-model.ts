/**
 *  GATEWAYS REFERENCES
 */

export const MERCADOPAGO_REF = {
    APP_ID: 'mp-app-17982543',
    PUBLIC_KEY: {
        SANDBOX: {
            PUBLIC_KEY: 'TEST-5200d047-ab92-433d-83eb-f08916707b6f',
            ACCESS_TOKEN: 'TEST-8475038305735553-012509-434860bc4c55f575402ab81b1cfc7edb__LB_LC__-17982543'
        },
        PROD: {
            PUBLIC_KEY: 'APP_USR-46e41c5f-8466-4d53-9539-8300227d8a33',
            ACCESS_TOKEN: 'APP_USR-8475038305735553-012509-7721ed50a0ffd618e593d148cb075fc6__LB_LD__-17982543'
        },
    }
}


/**
 *  MODELS
 */

export class PaymentResult {
    id:string;
    transactionId:string;
    status:string;
    completed:boolean;
}

export class paymentMethod {
    // attributes from API
    // https://www.mercadopago.com.ar/developers/en/api-docs/custom-checkout/payment-methods/
    id:string;
    name:string;
    payment_type_id:string;    
    status:string;
    secure_thumbnail:string;  
    thumbnail:string;
    deferred_capture:string;
    //settings:any; // object, if needed will set
    additional_info_needed:Array<any>;
    min_allowed_amount:number;
    max_allowed_amount:number;
    accreditation_time:number;    
    financial_institutions:Array<any>;    
    // custom
    _response_status:number;
    _error:string;
    _message:string;
}

export class CardTokenData {
    cardNumber:string;
    securityCode:string;
    cardExpirationMonth:string;
    cardExpirationYear:string;
    cardholderName:string;
    docType:string;
    docNumber:string;  
}