/**
 *  GATEWAYS REFERENCES
 */

export const MERCADOPAGO_REF = {
    APP_ID: '5819204648142051',
    PUBLIC_KEY: {
        SANDBOX: {
            PUBLIC_KEY: 'TEST-2ecd894c-f9bd-4824-9ded-55ac094171cb',
            ACCESS_TOKEN: 'TEST-5819204648142051-062712-77fb3c6d5a6aadcb94c60deb6cdf451f__LC_LD__-131322408'
        },
        PROD: {
            PUBLIC_KEY: 'APP_USR-5fdf1bed-643a-481d-86b3-e1f868a8829c',
            ACCESS_TOKEN: 'APP_USR-5819204648142051-062712-b191488d9b0734f851afd4abfd69a5c5__LB_LD__-131322408'
        },
    },
    BACKEND_SERVER: {
        LOCAL_URL: {
            PAYMENT: '',
        },
        DEV_URL: {
            PAYMENT: 'https://us-central1-moovendev.cloudfunctions.net/createPaymentMP',
        },
        STAGE_URL: {
            PAYMENT: '',
        },
        PROD_URL: {
            PAYMENT: '',
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
    paymentMethodId:string;
}

export class PrepaymentData {
    transactionAmount:number;
    cardToken:string;
    description:string;
    paymentMethodId:string;
    payerEmail:string;
    externalReference:string;
    suid:string;
    uid:string;
    puid:string;
}

export class PaymentData {
    transactionAmount:number;
    token:string;
    description:string;
    installments:number;
    paymentMethodId:string;
    payerEmail:string;
    externalReference:string;
    suid:string;
    uid:string;    
}