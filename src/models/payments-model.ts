
/**
 * MODEL CONFIGURATIONS
 */

export const PAYMENTS_CFG = {
    // TO DO
}


/**
 * PAYMENTS DATA 
 * FIREBASE REFERENCES
 */

export const PAYMENTS_DB = {
    ALL: {
        REF: 'payments/',
        _NODE: 'payments',
        _CHILD: {
            PAYMENTID: '/paymentId/',
            USERID: '/userId/',
        }
    }
}


/**
 * PAYMENTS MODELS
 */

export class Payment {
    id: string;
}

