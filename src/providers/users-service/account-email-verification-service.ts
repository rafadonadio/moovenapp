import { Injectable } from '@angular/core';
import { USER_DB_REF } from '../../models/user-model';

import firebase from 'firebase';

// firebase references
const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;

@Injectable()
export class AccountEmailVerificationService {

    dbRef = firebase.database().ref();

    constructor() {}

    resend(user:firebase.User) {
        console.info('resend user email verification');
        // TO-DO
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
