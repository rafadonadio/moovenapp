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
    createAccountStep1(fbuser:firebase.User):firebase.Promise<void> {
        console.info('userSrv.createAccountStep1');
        console.group('createAccountStep1');
        // init account
        let profileData = this.accountSrv.initAccountProfileData(fbuser.email);
        let profileStatus = this.accountSrv.initAccountProfileStatus();
        let profileVerifications = this.accountSrv.initAccountVerifications();
        let account = this.accountSrv.init(profileData, profileStatus, profileVerifications, fbuser);
        console.groupEnd();
        return this.accountSrv.createStep1(fbuser.uid, account);
    }

    createAccountStep2(profileData: any): firebase.Promise<any> {
        console.info('createAccountStep2 > start');
        console.group('createAccountStep2');
        // aux
        let fbuser = this.getUser();
        let displayName = profileData.firstName + ' ' + profileData.lastName;        
        let steps = {
            create: false,
            status: false,
            displayName: false,
        }
        // run        
        return new Promise((resolve, reject) => {
            this.accountSrv.createStep2(fbuser.uid, profileData)
                .then(() => {
                    console.log('[1] createStep2 > success');
                    steps.create = true;                    
                    // update account profile status                    
                    return this.accountSrv.updateProfileStatus(fbuser.uid);
                })
                .then(() => {
                    console.log('[2] updateProfileStatus > success');
                    steps.status = true
                    // update firebase user displayName
                    return this.auth.updateFirebaseUserDisplayName(displayName);                    
                })
                .then(() => {
                    console.log('[3] updateDisplayName > success');
                    steps.displayName = true;
                    console.groupEnd();
                    resolve(steps);
                })
                .catch((error) => {
                    console.log('createAccountStep2 > error', error, steps);
                    if(steps.create==true && steps.status==true) {
                        resolve(steps);
                    }else{
                        reject(error);
                    }
                    console.groupEnd();
                });
        });
    }

    // get authenticated user
    getUser(): firebase.User {
        return this.auth.getFirebaseUser();
    }

    // Reload authenticated user data
    reloadUser(): firebase.Promise<any> {
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
            this.auth.updateFirebaseUserEmail(newEmail)
                .then(() => {
                    console.log('auth.updateEmail > ok');
                    console.log('init create email verification ...');
                    this.emailVerification.create(user, true);
                    resolve();
                })
                .catch((error:any) => {
                    console.log('auth.updateEmail > error: ', error.code);
                    reject(error.code);
                });
        });
    }

    updatePhoneMobile(prefix:string, number:string): firebase.Promise<any> {
        let fbuser = this.getUser();        
        return this.accountSrv.updatePhoneMobile(fbuser.uid, prefix, number);
    }

    updateUserNames(firstName:string, lastName: string):Promise<any> {
        let fbuser = this.getUser();
        let steps = {
            updateDb: false,
            updateUser: false
        };
        return new Promise((resolve, reject) => {
            this.accountSrv.updateProfileNames(fbuser.uid, firstName, lastName)
                .then(() => {
                    console.log('updateProfileNames > success');
                    steps.updateDb = true;
                    let displayName = firstName + ' ' + lastName;
                    return this.auth.updateFirebaseUserDisplayName(displayName);
                })
                .then(() => {
                    steps.updateUser = true;
                    console.log('firebaseUser.updateProfile > success');
                    this.reloadUser();
                    resolve(steps);
                })
                .catch((error) => {
                    console.error('users.updateUserNames > error > ', error, steps);
                    reject(steps);
                });
        
        })
    }

    updateAccountImage(downloadURL:string, fullPath:string):Promise<any> {
        let fbuser:firebase.User = this.getUser();
        let steps = {
            updateDB: false,
            updateAuth: false
        }
        return new Promise((resolve, reject) => {
            this.accountSrv.updateProfileImage(fbuser.uid, downloadURL, fullPath)
                .then(() => {
                    console.log('updateProfileImage > success');
                    steps.updateDB = true;
                    return this.auth.updateFirebaseUserPhotoURL(downloadURL);
                })
                .then(() => {
                    console.log('updateFirebaseUserPhotoURL > success');
                    steps.updateAuth = true;
                    resolve(true);               
                })
                .catch((error:any) => {
                    if(steps.updateDB==true){
                        resolve(steps);
                    }else{
                        reject(error);
                    }
                });
        })
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
    getAccount():firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getByUid(user.uid);
    }

    getAccountProfileData(): firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getProfileDataByUid(user.uid);
    }

    getAccountProfileVerifications(): firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getProfileVerificationByUid(user.uid);
    }

    // get reference for profile verification email
    getRef_AccountEmailVerification():firebase.database.Reference {
        let user = this.getUser();
        return this.accountSrv.getRef_profileVerificationEmail(user.uid);
    }

    /**
     *  ACCOUNT - READ DATA
     */

    // check if value of UserAccount.active is 1
    accountIsActive(accountData: UserAccount):boolean {
        return this.accountSrv.isActive(accountData);
    }

    // check user account.profileComplete.type value is 1
    accountProfileFieldsIsComplete(accountData: UserAccount, profileType: string):boolean {
        return this.accountSrv.isProfileFieldsComplete(accountData, profileType);
    }

    // get profiles status
    accountProfilesStatus(accountData: UserAccount) {
        return this.accountSrv.getProfilesStatus(accountData);
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
    runAuthEmailVerification(): Promise<any> {
        // relaod user and check
        let fbuser = this.getUser();
        let steps = {
            reload: false,
            setVerified: false,
            updateStatus: false
        };
        console.group('runAuthEmailVerification');
        return new Promise((resolve, reject) => {
            this.reloadUser()
                .then((result) => {
                    console.log('reloadAuthUser > success');
                    steps.reload = true;
                    if(fbuser.emailVerified === true) {
                        return this.emailVerification.setVerified(fbuser);
                    }else{
                        console.groupEnd();
                        resolve(steps);
                    }
                })
                .then((result) => {
                    console.log('setVerified > success');
                    steps.setVerified = true;
                    return this.accountSrv.updateProfileStatus(fbuser.uid);
                })                
                .then((result) => {
                    console.log('updateProfileStatus > success');
                    steps.updateStatus = true;
                    console.groupEnd();
                    resolve(steps);
                })
                .catch((error) => {
                    console.log('something failed');
                    console.groupEnd();
                    reject(steps);
                });
        });
    }

}
