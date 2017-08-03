import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { AccountEmailVerificationService } from '../users-service/account-email-verification-service';
import { AuthService } from '../auth-service/auth-service';
import { UserAccount, UserAccountSettings, UserProfileData } from '../../models/user-model';

@Injectable()
export class AccountService {

    constructor(public afDb: AngularFireDatabase,
        private authSrv: AuthService,
        private emailVerification: AccountEmailVerificationService) {}
    
    /**
     *  GET
     */

    // get account Observable
    getObs(snapshot:boolean = false): FirebaseObjectObservable<any> {
        // console.log('uid', this.authSrv.fbuser);
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.object(`userAccount/${accountId}`, { preserveSnapshot: snapshot });
    }  


    /**
     *  UPDATE
     */

    updatePhoto(downloadURL:string, fullPath:string):firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        let updates = {};
        updates[`userAccount/${accountId}/profile/data/photoURL`] = downloadURL;
        updates[`userAccount/${accountId}/profile/data/photoPath`] = fullPath;
        return firebase.database().ref().update(updates);
    }

    updateProfileData(profileData: UserProfileData): firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        let updates = {};
        updates[`userAccount/${accountId}/profile/data`] = profileData;
        return firebase.database().ref().update(updates);
    }

    updateSettings(settings: UserAccountSettings): firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        let updates = {};
        updates[`userAccount/${accountId}/settings`] = settings;
        return firebase.database().ref().update(updates);
    }

    /**
     * Update user email, steps:
     * 1 update auth user email
     * 2 update account:
     *    - email and set onChange
     *    - set validation false
     * 3 trigger CF
     */
    changeEmail(newEmail: string): Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        return new Promise((resolve, reject) => {
            this.authSrv.updateEmail(newEmail)
                .then(() => {
                    console.log('auth updateEmail success');
                    let updates = {};
                    // update account verifications
                    updates[`userAccount/${accountId}/profile/verifications/email/verified`] = false;
                    updates[`userAccount/${accountId}/profile/verifications/email/verifiedAddress`] = '';
                    updates[`userAccount/${accountId}/profile/verifications/email/verifiedTimestamp`] = '';                    
                    // update account data email
                    updates[`userAccount/${accountId}/profile/data/email`] = newEmail;
                    updates[`userAccount/${accountId}/profile/data/emailOnChange`] = true;
                    return firebase.database().ref().update(updates);
                })
                .then(() => {
                    console.log('CF_Trigger: send email verification');
                    return this.resendEmailVerification();
                })
                .then(() => {
                    resolve();                    
                })
                .catch((error:any) => {
                    console.log('auth updateEmail error', error.code);
                    reject(error.code);
                });
        });
    }    

    /**
     *  CLOSE ACCOUNT
     */    

    terminateAccount(): firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        let updates = {};
        // update user
        updates[`userAccount/${accountId}/terminatedAt`] = firebase.database.ServerValue.TIMESTAMP;
        updates[`userAccount/${accountId}/active`] = false;
        // set userTask
        let tKey = firebase.database().ref(`userTask`).push().key;
        let userTask = {
            origin: 'app',
            task: 'terminate_account',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            userId: accountId
        };
        updates[`taskUser/${tKey}`] = userTask;        
        return firebase.database().ref().update(updates);        
    }


    /**
     *  ACCOUNT SIMPLE CHECKERS
     */

    exist(): Promise<{getId:boolean, exist:boolean}> {
        let result = {
            getId: false,
            exist: false,
        }
        // get user id or die
        let accountId = this.authSrv.fbuser ? this.authSrv.fbuser.uid : null;
        if(!accountId) {
            // die
            return Promise.resolve(result);
        }
        result.getId = true;
        // get account
        return new Promise((resolve, reject) => {
            firebase.database().ref(`userAccount/${accountId}`).once('value')
                .then(snap => {
                    console.log('account', snap.val());
                    result.exist = snap.val() ? true : false;
                    resolve(result);
                })
                .catch(error => {
                    console.log(error);
                    resolve(result);
                });
        });  
    }

    // is Account Active
    isActive(account:UserAccount):boolean {
        return account.active;
    }
    // is Account Basic Profile Complete
    isBasicProfileComplete(account: UserAccount):boolean {
        return account.profile.status.basic.fieldsComplete;
    }
    // is Account Basic Profile Verified
    isBasicProfileVerified(account: UserAccount):boolean {
        return account.profile.status.basic.verificationsComplete;
    }    


    /**
     *  EMAIL VERIFICATION
     */

    // trigger email verification process
    resendEmailVerification(): firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.emailVerification.resend(accountId);
    }

}