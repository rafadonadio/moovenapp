import { Injectable } from '@angular/core';
import { USER_DB_REF } from '../../models/user-model';

import firebase from 'firebase';

// firebase references
const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const EMAIL_VERIFIY_RESEND = '/userVerifyEmailResend/';

@Injectable()
export class AccountEmailVerificationService {

    dbRef = firebase.database().ref();

    constructor() {}

    // resend email verification
    // writes to list in DB to trigger CF that runs the email sending
    resend(user:firebase.User): firebase.Promise<any> {
        console.info('emailVerification:resend');
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let key = this.dbRef.child(EMAIL_VERIFIY_RESEND).push().key;
        let data = {
            userId: user.uid,
            timestamp: timestamp 
        }
        let updates = {};
        // push to list, to trigger CF
        updates[`${EMAIL_VERIFIY_RESEND}/${key}`] = data;
        return this.dbRef.update(updates);
    }

    setVerified(fbuser:firebase.User): firebase.Promise<any> {
        console.info('account email setVerified, start');
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let updates = {};
        // set account.profile.data.email
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'email'] = fbuser.email;
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'emailOnChange'] = false;
        // set account.profile.verifications values
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.VERIFIED] = fbuser.emailVerified;        
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.VERIFIED_ADDRESS] = fbuser.email;
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.VERIFIED_TIMESTAMP] = timestamp;        
        // update!
        return this.dbRef.update(updates);           
    }

}
