
/**
 * APP CONFIGURATIONS
 */

export const APP_CFG = {
    ENV: 'DEV', // current environment > DEV, STAGE, PROD
    ENVIRONMENTS: {
        'DEV': {
            FIREBASE: {
                apiKey: "AIzaSyC6tq6l0EVThcHsvkWHEoPYenGZg2p7PiU",
                authDomain: "mooven-f9e3c.firebaseapp.com",
                databaseURL: "https://mooven-f9e3c.firebaseio.com",
                storageBucket: "mooven-f9e3c.appspot.com",
                messagingSenderId: "301998553220",
                _localStorageKey: 'firebase:host:mooven-f9e3c.firebaseio.com',                
            },
            LOCALSTORAGE: {
                name: '__moovenDev'
            },
        },
        'STAGE': {

        },
        'PROD': {

        }
    }
}