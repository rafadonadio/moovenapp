import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { USER_DB_REF } from '../../models/user-model';
import { LogUserEmailVerificationAttempts, LOG_DB_REF } from '../../models/log-model';

// firebase references
const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const REF_LOG_EMAIL_VERIFICATIONS = LOG_DB_REF.LOG_USER_EMAIL_VERIFICATION_ATTEMPTS;

@Injectable()
export class AccountEmailVerificationService {

    dbRef = firebase.database().ref();

    constructor(public af:AngularFire) {

    }

    /**
     *  FIREBASE EMAIL VERIFICATION
     */
    // set account email value
    // set email verified false
    // send email verification to current user
    // First save the current request and then send the email
    create(fbuser: firebase.User, isAnUpdateRequest:boolean = false): void {
        // aux
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        // data to set in account
        let profileVerificationAttempt:any = {
           timestamp: timestamp, 
           reference:fbuser.email
        };
        // data to set in attempts
        let logData: LogUserEmailVerificationAttempts = {
            timestamp: timestamp,
            email: fbuser.email,
            userId: fbuser.uid,
        };
        // get log new key
        let logKey = this.dbRef.child(REF_LOG_EMAIL_VERIFICATIONS).push().key;
        // db aupdates array
        let updates = {};
        // update account email
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'email'] = fbuser.email;
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'emailOnChange'] = isAnUpdateRequest;
        // update account validation values
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.VERIFIED] = false;
        updates[ACCOUNT_REF + fbuser.uid + ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.ATTEMPTS_IDS +  logKey] = profileVerificationAttempt;
        // save data to log 
        updates[REF_LOG_EMAIL_VERIFICATIONS + logKey] = logData;
        // update!
        this.dbRef.update(updates)
            .then(() => {
                console.log('email verification create > ok');
                // send the verification email with firebase
                fbuser.sendEmailVerification();
            })
            .catch((error:any) => {
                console.log('email verification creation failed ', error.code);
            });
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
