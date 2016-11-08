import { Injectable } from '@angular/core';

import { AuthenticationService } from '../authentication-service/authentication-service';
import { AccountService } from '../account-service/account-service';
import { ProfileService } from '../profile-service/profile-service';
import { AccountEmailVerificationService } from '../account-email-verification-service/account-email-verification-service';

import { UserCredentials } from '../../shared/user-interface';
import { UserAccount } from '../../shared/user-interface';


@Injectable()
export class UsersService {

    constructor(public auth: AuthenticationService,
        public account: AccountService,
        public profile: ProfileService,
        public emailVerification: AccountEmailVerificationService) {
    }


    /**
     * USER CRUD
     */

    // create firebase user
    createUserWithEmailAndPassword(user: UserCredentials) {
     return this.auth.createFirebaseUserWithEmailAndPassword(user.email, user.password);
    }

    // Create User account and profile in firebase database
    createAccountFromCurrentUser() {
        var user = this.getCurrentUser();
        // init account
        var account: UserAccount = this.account.initAccountData(user);
        // init profile
        var profile = this.profile.initProfileData();
        // create account and profile
        return this.account.createAccountAndProfileInFirebaseDB(user.uid, account, profile);
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
        var user = this.getCurrentUser();
        return new Promise((resolve, reject) => {
            this.auth.updateEmail(user, newEmail)
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

    // update authenticated user displayName
    updateCurrentUserDisplayName(displayName: string) {
        return this.auth.updateFirebaseUserDisplayName(displayName);
    }

    // get authenticated user
    getCurrentUser(): any {
        return this.auth.getCurrentFirebaseUser();
    }

    // Reload authenticated user data
    reloadCurrentUser(): Promise<void> {
        return this.auth.reloadCurrentFirebaseUser();
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
    getCurrentUserAccount(): Promise<any> {
        var user = this.getCurrentUser();
        return this.account.getByUid(user.uid);
    }

    getAccountEmailVerifiedRef() {
        var user = this.getCurrentUser();
        return this.account.emailVerifiedRef(user.uid);
    }

    // check if value of UserAccount.active is 1
    isAccountActive(accountData: UserAccount):boolean {
        return this.account.isActive(accountData);
    }
    // returns account emailVerified value
    isAccountEmailVerified (accountData: UserAccount): boolean {
        return this.account.isEmailVerified(accountData);
    }
    // check user account.profileComplete.type value is 1
    isProfileComplete(accountData: UserAccount, profileType: string):boolean {
        return this.account.isProfileComplete(accountData, profileType);
    }


    /**
     *  PROFILE
     */

    getCurrentUserProfile(): Promise<any> {
        var user = this.getCurrentUser();
        return this.profile.getByUid(user.uid);
    }

    updateUserProfile(data: any): any {
        var user = this.getCurrentUser();
        var uid = user.uid;
        return this.profile.update(uid, data);
    }

    checkUserProfileCompleteStatus() {
        var user = this.getCurrentUser();
        this.profile.getByUid(user.uid)
            .then((snapshot) => {
                var profile = snapshot.val();
                console.log('user profile > ', profile);
                // check profile status
                var status = {basic: 0, image: 0, documentation: 0};
                // basic
                status.basic = this.profile.isBasicComplete(profile) ? 1 : 0;
                // image
                status.image = this.profile.isImageComplete(profile) ? 1 : 0;
                // more ...
                console.log('checked ProfileCompleteStatus > ', status);
                // update DB
                this.account.updateProfileCompleteStatus(user.uid, status)
                    .then(function(result) {
                        console.log('account update ok');
                    })
                    .catch(function(error) {
                        console.log('account update failed > ', error);
                    });
            })
            .catch((error) => {
                console.log('read profile error > ', error);
            });
    }


    /**
     *  EMAIL VERIFICATION
     */

    // send email verification code and record the process
    sendEmailVerification(): void {
        var user:any = this.getCurrentUser();
        this.emailVerification.create(user);
    }

    // run email verification
    // reload user > check emailVerified value > if true, save success and update account
    runUserEmailVerificationCheck(): Promise<boolean> {
        // relaod user and check
        return new Promise((resolve, reject) => {
            this.reloadCurrentUser()
                .then(() => {
                    console.log('reloadCurrentUser ok');
                    var user = this.getCurrentUser();
                    if(user.emailVerified === true) {
                        resolve(this.emailVerification.saveSuccess(user));
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
