import { Injectable } from '@angular/core';

import { AuthenticationService } from '../users-service/authentication-service';
import { AccountServiceOld } from '../users-service/account-service';
import { AccountSettingsService } from '../users-service/account-settings-service';
import { AccountEmailVerificationService } from '../users-service/account-email-verification-service';

import { UserAccount } from '../../models/user-model';

import firebase from 'firebase';

@Injectable()
export class UsersService {

    constructor(public authSrv: AuthenticationService,
        public accountSrv: AccountServiceOld,
        public emailVerification: AccountEmailVerificationService,
        public settingsSrv: AccountSettingsService) {
    }

    // get authenticated user
    getUser(): firebase.User {
        return this.authSrv.getFirebaseUser();
    }

    // Reload authenticated user data
    reloadUser(): firebase.Promise<any> {
        return this.authSrv.reloadFirebaseUser();
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
        let fbuser = this.getUser();
        return new Promise((resolve, reject) => {
            this.authSrv.updateFirebaseUserEmail(newEmail)
                .then(() => {
                    console.log('auth.updateEmail > ok');
                    return this.accountSrv.updateEmail(fbuser.uid, newEmail);
                })
                .then(() => {
                    console.log('CF_Trigger: userEmailUpdate > send email verification');
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
                    return this.authSrv.updateFirebaseUserDisplayName(displayName);
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

    // updateAccountImage(downloadURL:string, fullPath:string):Promise<any> {
    //     let fbuser:firebase.User = this.getUser();
    //     let steps = {
    //         updateDB: false,
    //         updateAuth: false
    //     }
    //     return new Promise((resolve, reject) => {
    //         this.accountSrv.updateProfileImage(fbuser.uid, downloadURL, fullPath)
    //             .then(() => {
    //                 console.log('updateProfileImage > success');
    //                 steps.updateDB = true;
    //                 return this.authSrv.updateFirebaseUserPhotoURL(downloadURL);
    //             })
    //             .then(() => {
    //                 console.log('updateFirebaseUserPhotoURL > success');
    //                 steps.updateAuth = true;
    //                 resolve(true);               
    //             })
    //             .catch((error:any) => {
    //                 if(steps.updateDB==true){
    //                     resolve(steps);
    //                 }else{
    //                     reject(error);
    //                 }
    //             });
    //     })
    // }

    /**
     *  ACCOUNT
     */

    // get user account data
    getAccount():firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getByUid(user.uid);
    }
    // getAccountObs() {
    //     let user = this.getUser();
    //     return this.accountSrv.getObsById(user.uid, true);
    // }    

    getAccountProfileData(): firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getProfileDataByUid(user.uid);
    }

    // getAccountProfileVerifications(): firebase.Promise<any> {
    //     let user = this.getUser();
    //     return this.accountSrv.getProfileVerificationByUid(user.uid);
    // }

    getAccountSettings(): firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getSettingsByUid(user.uid);
    }

    // get reference for profile verification email
    // getRef_AccountEmailVerification():firebase.database.Reference {
    //     let user = this.getUser();
    //     return this.accountSrv.getRef_profileVerificationEmail(user.uid);
    // }

    // GET OTHER USERS DATA

    // get user account data
    getAccountProfileDataByUid(uid:string): firebase.Promise<any> {
        return this.accountSrv.getProfileDataByUid(uid);
    }    


    /**
     *  ACCOUNT - READ DATA
     */

    // check if value of UserAccount.active is 1
    // accountIsActive(accountData: UserAccount):boolean {
    //     return this.accountSrv.isActive(accountData);
    // }

    // check user account.profileComplete.type value is 1
    // accountProfileFieldsIsComplete(accountData: UserAccount, profileType: string):boolean {
    //     return this.accountSrv.isProfileFieldsComplete(accountData, profileType);
    // }

    // get profiles status
    // accountProfilesStatus(accountData: UserAccount) {
    //     return this.accountSrv.getProfilesStatus(accountData);
    // }

    // SETTINGS

    // checkAccountSettingsConsistency(account: UserAccount):boolean {         
    //     if(this.settingsSrv.settingsExistInAccount(account)) {
    //         return this.settingsSrv.checkConsistency(account.settings);
    //     }else{
    //         return false;
    //     }
    // }

    // initAccountSettingsMissingParams(account: UserAccount) {
    //     let fbuser = this.getUser();
    //     return new Promise((resolve, reject) => {
    //         // check settings exist
    //         if(this.settingsSrv.settingsExistInAccount(account)) {
    //             // check consistency, complete or resolve ok
    //             if(this.settingsSrv.checkConsistency(account.settings)) {
    //                 resolve(true);
    //             }else{
    //                 this.settingsSrv.completeMissingValuesInDB(fbuser.uid, account.settings)
    //                     .then(() => {
    //                         console.log('completeMissingValuesInDB > success');
    //                         resolve(true);
    //                     })
    //                     .catch((error) => {
    //                         reject(error);
    //                     });
    //             }
    //         }else{
    //             this.settingsSrv.setInitValuesInDB(fbuser.uid)
    //                 .then(() => {
    //                     console.log('setInitValuesInDB > success');
    //                     resolve(true);
    //                 })
    //                 .catch((error) => {
    //                     reject(error);
    //                 });
    //         }   
    //     });
    // }

    // updateAccountSettingsNotifications(notifications:any):firebase.Promise<any> {
    //     let fbuser = this.getUser();
    //     return this.settingsSrv.updateNotificationsInDB(fbuser.uid, notifications);
    // }

    // updateUserProfileStatus() {
    //     let fbuser = this.getUser();
    //     return this.accountSrv.updateProfileStatus(fbuser.uid);
    // }

}
