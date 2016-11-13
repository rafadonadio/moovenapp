import { Injectable } from '@angular/core';

import { AuthenticationService } from '../users-service/authentication-service';
import { AccountService } from '../users-service/account-service';
import { ProfileService } from '../users-service/profile-service';
import { AccountEmailVerificationService } from '../users-service/account-email-verification-service';

import { UserCredentials, UserAccount } from '../../models/user-model';


@Injectable()
export class UsersService {

    constructor(public auth: AuthenticationService,
        public accountSrv: AccountService,
        public profile: ProfileService,
        public emailVerification: AccountEmailVerificationService) {
    }


    /**
     * USER CRUD
     */

    // create firebase user
    createUserWithEmailAndPassword(user: UserCredentials):Promise<firebase.User> {
     return this.auth.createFirebaseUserWithEmailAndPassword(user.email, user.password);
    }

    // Create User account and profile in firebase database
    createUserAccount(fbuser:firebase.User):Promise<void> {
        console.info('userSrv.creatUserAccount');
        // init account
        let profileData = this.accountSrv.initAccountProfileData(fbuser.email);
        let profileStatus = this.accountSrv.initAccountProfileStatus();
        let profileVerifications = this.accountSrv.initAccountVerifications();
        let account = this.accountSrv.initData(profileData, profileStatus, profileVerifications, fbuser);
        return this.accountSrv.writeToFirebaseDb(fbuser.uid, account);
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
        var user = this.getUser();
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
    updateUserDisplayName(displayName: string) {
        return this.auth.updateFirebaseUserDisplayName(displayName);
    }

    // get authenticated user
    getUser(): any {
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
    getUserAccount():Promise<any> {
        var user = this.getUser();
        return this.accountSrv.getByUid(user.uid);
    }

    getAccountEmailVerifiedRef() {
        var user = this.getUser();
        return this.accountSrv.emailVerifiedRef(user.uid);
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
    isProfileComplete(accountData: UserAccount, profileType: string):boolean {
        return this.accountSrv.isProfileComplete(accountData, profileType);
    }


    /**
     *  PROFILE
     */

    getCurrentUserProfile(): Promise<any> {
        var user = this.getUser();
        return this.profile.getByUid(user.uid);
    }

    updateUserProfile(data: any): any {
        var user = this.getUser();
        var uid = user.uid;
        return this.profile.update(uid, data);
    }

    checkUserProfileCompleteStatus() {
        var user = this.getUser();
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
                this.accountSrv.updateProfileCompleteStatus(user.uid, status)
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
        var user:any = this.getUser();
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
                    var user = this.getUser();
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
