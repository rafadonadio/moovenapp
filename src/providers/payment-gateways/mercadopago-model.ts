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