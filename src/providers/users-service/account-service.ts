import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { AccountProfileService } from '../users-service/account-profile-service';
import { AccountVerificationsService } from '../users-service/account-verifications-service';
import {
    USER_CFG,
    USER_DB_REF,
    UserAccount,
    UserProfileData,
    UserProfileStatus,
    UserProfileVerifications
} from '../../models/user-model';
import { TOS_CFG } from '../../models/tos-model';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const PROFILES_LIST = USER_CFG.ACCOUNT.PROFILE.LIST;

@Injectable()
export class AccountService {

    db = firebase.database();
    dbRef = firebase.database().ref();

    constructor(public af:AngularFire,
        public profileSrv:AccountProfileService,
        public verificSrv:AccountVerificationsService) {
    }

    /**
     *  WRITE TO DATABASE
     */

    // create database node for user account
    createStep1(userId: string, account: UserAccount):firebase.Promise<any> {
        let updates = {};
        updates[ACCOUNT_REF + userId] = account;
        return this.dbRef.update(updates);
    }

    // Updates account created in step1, with required fields
    createStep2(userId: string, data: any):firebase.Promise<any>  {
        console.info('createStep2 > start');
        let timestamp = firebase.database.ServerValue.TIMESTAMP;
        let ToS = {
            id: TOS_CFG.CURRENT_VERSION_ID,
            tag: TOS_CFG.CURRENT_VERSION_TAG,
            historyData: {
                versionId: TOS_CFG.CURRENT_VERSION_ID, 
                timestamp: timestamp 
            }
        }
        let updates = {}; // must be an object of arrays not an array of arrays
        let newHistoryKey = this.dbRef.child(ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.HISTORY).push().key; 
        // update profile data
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'firstName'] = data.firstName;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'lastName'] = data.lastName;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'phonePrefix'] = data.phonePrefix;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'phoneMobile'] = data.phoneMobile;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + 'lastTosAccepted'] = '';
        // update ToS
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.ACCEPTED ] = true;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.ACCEPTED_TIMESTAMP] = timestamp;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.ACCEPTED_VERSION_ID] = ToS.id;
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.ACCEPTED_VERSION_TAG] = ToS.tag;
        // add log tos history array
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.HISTORY + newHistoryKey] = ToS.historyData;
        console.log('createStep2 > vars > ', ToS, updates, newHistoryKey);
        return this.dbRef.update(updates);
    }

    updateProfileStatus(userId: string): Promise<any> {
        console.info('updateProfileStatus > start');
        return new Promise((resolve, reject) => {
            this.getByUid(userId)
                .then((snapshot) => {
                    console.log('updateProfileStatus > getProfile > ok');
                    let account:UserAccount = snapshot.val();
                    return this.profileSrv.updateStatus(userId, account.profile);
                })
                .then((result) => {
                    console.log('updateProfileStatus > update > success');
                    resolve(result);
                })
                .catch((error) => {
                    console.error('updateProfileStatus > error: ', error);
                    reject(error);
                });
        })

    }

    /**
     *  READ FROM DATABASE
     */

    // get user account node from firebase database
    getByUid(userId: string):firebase.Promise<any> {
        return this.dbRef
                .child(ACCOUNT_REF + userId)
                .once('value');
    }

    // get account.profile.data from firebase database
    getProfileDataByUid(userId: string): firebase.Promise<any> {
        return this.profileSrv.getDataByUid(userId);
    }    
    // get account.profile.data from firebase database
    getProfileVerificationByUid(userId: string): firebase.Promise<any> {
        return this.profileSrv.getVerificationsByUid(userId);
    }    


    /**
     *  GET DATABASE REFERENCE
     */

    // get user account email verified node from firebase database
    getRef_profileVerificationEmail(userId: string): firebase.database.Reference {
        return this.profileSrv.getRef_emailVerification(userId);
    }

    /**
     *  READ FROM ACCOUNT
     */

    // check if value of account.active is 1
    isActive(account: UserAccount):boolean {
        return account.active;
    }
    // set status of each of accounts profiles (basic, sender, operator), based on completion
    getProfilesStatus(account: UserAccount): any {
        let status = {};
        for(let typeU in PROFILES_LIST) {  
            let typeL = PROFILES_LIST[typeU];          
            status[typeL] = false;
            if(account.profile.status[typeL].fieldsComplete===true 
                && account.profile.status[typeL].verificationsComplete===true){
                status[typeL] = true;
            }
        }
        console.log('getProfilesStatus > ', status);
        return status;
    }
    //get account.profile.verifications.email.verified
    isEmailVerified (account: UserAccount): boolean {
        return account.profile.verifications.email.verified;
    }
    // get user account.profileComplete.type value is 1
    isProfileFieldsComplete(account: UserAccount, profileType: string):boolean {
        return account.profile.status[profileType].fieldsComplete;
    }



    /**
     *  INITIALIZATION OF ACCOUNT DATA
     */

    init(profileData:UserProfileData, 
        profileStatus:UserProfileStatus, 
        profileVerifications:UserProfileVerifications, 
        fbuser:firebase.User): UserAccount {
        console.info('accountSrv.initData');
        // set
        let account:UserAccount = {
            active: true, 
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            deletedAt: 0,
            providerId: fbuser.providerId,
            profile: {
                data: profileData,
                status: profileStatus,
                verifications: profileVerifications                
            },
            ToS: {
                accepted: false,
                acceptedTimestamp: 0,
                acceptedVersionId: 0,
                acceptedVersionTag: '',
                history: [],
            }            
        }
        console.log('accountSrv.initData > ', account);
        return account;
    }

    initAccountProfileData(email: string):UserProfileData {
        return this.profileSrv.initData(email);
    }

    initAccountProfileStatus() {
        return this.profileSrv.initStatus();
    }

    initAccountVerifications():UserProfileVerifications {
        return this.profileSrv.initVerifications();
    }

}
