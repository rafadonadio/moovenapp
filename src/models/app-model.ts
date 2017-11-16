
/**
 * APP CONFIGURATIONS
 */

export const APP_CFG = {
    CURRENT_ENV: 'DEV', // DEV, PROD
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
                ID: 'c7d12063',
            }
        },
        'PROD': {
            APP_NAME: 'MOOVEN',
            FIREBASE: {
                apiKey: "AIzaSyBqzeQjuoqMufM3r0qNyMwgQLJoI6D6zXI",
                authDomain: "mooven-production-5fb0b.firebaseapp.com",
                databaseURL: "https://mooven-production-5fb0b.firebaseio.com",
                projectId: "mooven-production-5fb0b",
                storageBucket: "mooven-production-5fb0b.appspot.com",
                messagingSenderId: "411770841728"              
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