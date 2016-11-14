import { Injectable } from '@angular/core';

import { AuthenticationService } from '../users-service/authentication-service';
import { AccountService } from '../users-service/account-service';
import { AccountEmailVerificationService } from '../users-service/account-email-verification-service';

import { UserCredentials, UserAccount } from '../../models/user-model';


@Injectable()
export class UsersService {

    constructor(public auth: AuthenticationService,
        public accountSrv: AccountService,
        public emailVerification: AccountEmailVerificationService) {
    }

    /**
     * USER CRUD
     */

    // create firebase user
    createUser(user: UserCredentials):Promise<firebase.User> {
     return this.auth.createFirebaseUserWithEmailAndPassword(user.email, user.password);
    }

    // Create User account and profile in firebase database
    createAccount(fbuser:firebase.User):firebase.Promise<void> {
        console.info('userSrv.creatUserAccount');
        // init account
        let profileData = this.accountSrv.initAccountProfileData(fbuser.email);
        let profileStatus = this.accountSrv.initAccountProfileStatus();
        let profileVerifications = this.accountSrv.initAccountVerifications();
        let account = this.accountSrv.init(profileData, profileStatus, profileVerifications, fbuser);
        return this.accountSrv.create(fbuser.uid, account);
    }

    completeAccountSignup(data: any): any {
        let fbuser = this.getUser();
        return this.accountSrv.completeSignup(fbuser.uid, data);
    }

    // update authenticated user displayName
    updateUserDisplayName(displayName: string) {
        return this.auth.updateFirebaseUserDisplayName(displayName);
    }

    // get authenticated user
    getUser(): firebase.User {
        return this.auth.getFirebaseUser();
    }

    // Reload authenticated user data
    reloadUser(): Promise<void> {
        return this.auth.reloadFirebaseUser();
    }

    /**
     * Update user email, steps:
     * 1 update fb user email
     * 2 update account email
     * 3 set false email verified
     * 4 create verification email
     * @param  {string}       newEmail [Email to be updated]
     * @return {Promise<any>}          [description]
     */
    updateUserEmail(newEmail: string): Promise<any> {
        let user = this.getUser();
        return new Promise((resolve, reject) => {
            this.auth.updateFirebaseUserEmail(user, newEmail)
                .then(() => {
                    console.log('auth.updateEmail > ok');
                    console.log('init create email verification ...');
                    this.emailVerification.create(user);
                    resolve();
                })
                .catch((error) => {
                    console.log('auth.updateEmail > error: ', error.code);
                    reject(error.code);
                });
        });
    }

    /**
     *  AUTHENTICATION
     */

    // login
    signIn(user: UserCredentials) {
        return this.auth.signInWithEmailAndPassword(user.email, user.password);
    }
    // logout
    signOut() {
        return this.auth.signOutFromFirebase();
    }
    // password reset
    resetPassword(email: string): Promise<void> {
        return this.auth.sendPasswordResetEmail(email);
    }

    /**
     *  ACCOUNT
     */

    // get user account data
    getUserAccount():firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getByUid(user.uid);
    }

    // check if value of UserAccount.active is 1
    isAccountActive(accountData: UserAccount):boolean {
        return this.accountSrv.isActive(accountData);
    }
    // returns account emailVerified value
    isAccountEmailVerified (accountData: UserAccount): boolean {
        return this.accountSrv.isEmailVerified(accountData);
    }
    // check user account.profileComplete.type value is 1
    isAccountProfileComplete(accountData: UserAccount, profileType: string):boolean {
        return this.accountSrv.isProfileComplete(accountData, profileType);
    }

    getAccountEmailVerifiedRef():firebase.database.Reference {
        let user = this.getUser();
        return this.accountSrv.getEmailVerifiedRef(user.uid);
    }

    /**
     *  ACCOUNT PROFILE
     */

    getAccountProfile(): firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getProfileDataByUid(user.uid);
    }

    updateAccountProfileStatus(): void {
        let fbuser = this.getUser();        
        this.accountSrv.updateProfileStatus(fbuser.uid);
    }

    /**
     *  EMAIL VERIFICATION
     */

    // send email verification code and record the process
    sendEmailVerification(): void {
        let user:firebase.User = this.getUser();
        this.emailVerification.create(user);
    }

    // run email verification
    // reload user > check emailVerified value > if true, save success and update account
    runUserEmailVerificationCheck(): Promise<boolean> {
        // relaod user and check
        return new Promise((resolve, reject) => {
            this.reloadUser()
                .then(() => {
                    console.log('reloadCurrentUser ok');
                    let user = this.getUser();
                    if(user.emailVerified === true) {
                        resolve(this.emailVerification.setVerified(user));
                    }else{
                        resolve(false);
                    }
                })
                .catch((error) => {
                    console.log('reloadCurrentUser failed');
                });
        });
    }

}
