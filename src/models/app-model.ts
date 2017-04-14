
/**
 * APP CONFIGURATIONS
 */

export const APP_CFG = {
    CURRENT_ENV: 'DEV', // DEV, STAGE, PROD
    ENVIRONMENTS: {
        'DEV': {
            APP_NAME: 'MOOVEN.dev',
            FIREBASE: {
                apiKey: 'AIzaSyBNWjiziTT1lzPL1WIl2pffupVa-ABJp7E',
                authDomain: 'moovendev.firebaseapp.com',
                databaseURL: 'https://moovendev.firebaseio.com',
                projectId: 'moovendev',
                storageBucket: 'moovendev.appspot.com',
                messagingSenderId: '496410495970',               
            },
            LOCALSTORAGE: {
                name: '__moovenDev'
            },
            IONIC_IO: {
                ID: 'c9b3dcc7',
            }
        },
        'STAGE': {
            APP_NAME: 'MOOVEN STAGE',
            FIREBASE: {
                apiKey: 'AIzaSyCuvzqFIK_emRtUTglniXBdEUYEOIPWIfE',
                authDomain: 'moovenstage.firebaseapp.com',
                databaseURL: 'https://moovenstage.firebaseio.com',
                projectId: 'moovenstage',
                storageBucket: 'moovenstage.appspot.com',
                messagingSenderId: '34166889782',              
            },
            LOCALSTORAGE: {
                name: '__moovenStage'
            },
            IONIC_IO: {
                ID: '7cbebd36',
            }
        },
        'PROD': {
            APP_NAME: 'MOOVEN',
            FIREBASE: {
                apiKey: 'AIzaSyC6tq6l0EVThcHsvkWHEoPYenGZg2p7PiU',
                authDomain: 'mooven-f9e3c.firebaseapp.com',
                databaseURL: 'https://mooven-f9e3c.firebaseio.com',
                projectId: 'mooven-f9e3c',
                storageBucket: 'mooven-f9e3c.appspot.com',
                messagingSenderId: '301998553220',                
            },
            LOCALSTORAGE: {
                name: '__moovenApp'
            },
            IONIC_IO: {
                ID: 'b7c29866',
            }
        }
    }
}