import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { AccountProfileService } from '../users-service/account-profile-service';
import { AccountVerificationsService } from '../users-service/account-verifications-service';
import { UserAccount, UserProfileData, UserProfileStatus, UserProfileVerifications, USER_DB_REF } from '../../models/user-model';
import { TOS_CFG } from '../../models/tos-model';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;

@Injectable()
export class AccountService {

    db = firebase.database();
    dbRef = firebase.database().ref();

    constructor(public af:AngularFire,
        public profileSrv:AccountProfileService,
        public verificSrv:AccountVerificationsService) {
    }

    /**
     *  WRITE
     */

    // create database node for user account
    createStep1(userId: string, account: UserAccount):firebase.Promise<any> {
        let updates = {};
        updates[ACCOUNT_REF + userId] = account;
        return this.dbRef.update(updates);
    }

    // update user profile (updates only the included nodes)
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
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.TOS.HISTORY + newHistoryKey] = ToS.historyData;
        console.log('completeSignup > data > ', ToS, updates, newHistoryKey);
        return this.dbRef.update(updates);
    }

    updateProfileStatus(userId: string): void {
        console.info('updateProfileStatus > start');
        this.getProfileDataByUid(userId)
            .then((snapshot) => {
                let profileData: UserProfileData = snapshot.val();
                return this.profileSrv.updateStatus(userId, profileData);
            })
            .catch((error) => {
                console.error('updateProfileStatus > getProfile > error: ', error);
            });
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

    // get user account email verified node from firebase database
    getEmailVerifiedRef(userId: string): firebase.database.Reference {
        return this.verificSrv.getRef_emailVerified(userId);
    }

    /**
     *  READ FROM ACCOUNT
     */

    // check if value of account.active is 1
    isActive(account: UserAccount):boolean {
        return account.active;
    }

    isEmailVerified (account: UserAccount): boolean {
        return account.verifications.email.verified;
    }

    // check user account.profileComplete.type value is 1
    isProfileComplete(account: UserAccount, profileId: string):boolean {
        return account.profile.status[profileId].complete;
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
            providerId: fbuser.providerId,
            profile: {
                data: profileData,
                status: profileStatus
            },
            verifications: profileVerifications,
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
        return this.verificSrv.init();
    }

}
