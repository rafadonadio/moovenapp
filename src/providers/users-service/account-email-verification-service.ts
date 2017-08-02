import { Injectable } from '@angular/core';
import firebase from 'firebase';


@Injectable()
export class AccountEmailVerificationService {

    dbRef = firebase.database().ref();

    constructor() {}

    // resend email verification
    // writes to list in DB to trigger CF that runs the email sending
    resend(user:firebase.User): firebase.Promise<any> {
        console.info('emailVerification:resend');
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let key = this.dbRef.child('userVerifyEmailResend').push().key;
        let data = {
            userId: user.uid,
            timestamp: timestamp 
        }
        let updates = {};
        // push to list, to trigger CF
        updates[`userVerifyEmailResend/${key}`] = data;
        return this.dbRef.update(updates);
    }

}
