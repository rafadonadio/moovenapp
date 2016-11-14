import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { UserAccount, UserProfileData, UserProfileStatus, UserProfileVerifications, USER_DB_REF, USER_CFG } from '../../models/user-model';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const ACCOUNT_CFG = USER_CFG.ACCOUNT;

@Injectable()
export class AccountService {

    db = firebase.database();
    dbRef = firebase.database().ref();

    constructor(public af:AngularFire) {
    }

    /**
     *  WRITE
     */

    // create database node for user account
    writeNewAccount(userId: string, account: UserAccount):firebase.Promise<any> {
        var updates = {};
        updates[ACCOUNT_REF + userId] = account;
        return this.dbRef.update(updates);
    }

    // update user profile (updates only the included nodes)
    updateProfileData(userId: string, data: any): firebase.Promise<any> {
        var profileData:any = {
            firstName: data.firstName,
            lastName: data.lastName,
            phonePrefix: data.phonePrefix,
            phoneMobile: data.phoneMobile
            //***photoURL > update in separate method***
        };
        var updates = {};
        for(let field in profileData) {
            updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + field] = profileData[field];
        }
        return this.dbRef.update(updates);
    }

    updateProfileStatus(userId: string): void {
        console.info('updateProfileStatus > start');
        console.group('profileStatus');
        this.getProfileDataByUid(userId)
            .then((snapshot) => {
                // set profile
                let profile:UserProfileData = snapshot.val();
                let status = this.initAccountProfileStatus();
                
                // check required fields for basic
                // start in true
                // set false if at least one field is empty
                status.basic.complete = true; //
                ACCOUNT_CFG.PROFILE.REQUIRED_FIELDS.BASIC
                    .forEach( function(item, index){
                        console.log('foreach > ', item, index);
                        if(profile[item]==='') {
                            status.basic.complete = false;
                        }
                    }); 
                let updates = {};
                updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.STATUS._NODE] = status;
                console.groupEnd();
                return this.dbRef.update(updates);
            })
            .catch((error) => {
                console.error('updateProfileStatus > getProfile > error: ', error);
                console.groupEnd();
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
        let child = ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._NODE;
        console.log('getProfileDataByUid > child ', child);
        return this.dbRef
                .child(child)
                .once('value');
    }    

    // get user account email verified node from firebase database
    emailVerifiedRef(userId: string): firebase.database.Reference {
        return this.dbRef
                .child(ACCOUNT_REF + userId)
                .child(ACCOUNT_REF_CHILDS.VERIFICATIONS.EMAIL.VERIFIED);
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

    initData(profileData:UserProfileData, 
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
                acceptedVersion: '',
                history: [],
            }            
        }
        console.log('accountSrv.initData > ', account);
        return account;
    }

    initAccountProfileData(email: string):UserProfileData {
        console.info('initAccountProfileData');
        let data:UserProfileData = {
            email: email,
            firstName: '',
            lastName: '',
            phonePrefix: '',
            phoneMobile: '',
            photoURL: '',
            dateBirth: '',
            legalIdentityNumber: '',
            residenceCountry: '',
            residenceCity: '',
            residenceAddress: '',
            residenceAddressL2: '',
            lastTosAccepted: ''
        }
        console.log('initAccountProfileData > data ', data);
        return data;
    }

    initAccountProfileStatus() {
        console.info('initAccountProfileStatus');
        let status:UserProfileStatus;
        status = {
            basic: {
                requiredFields: false,
                requiredVerifications: false,
                complete: false
            },
            sender: {
                requiredFields: false,
                requiredVerifications: false,
                complete: false
            },            
            operator: {
                requiredFields: false,
                requiredVerifications: false,
                complete: false
            },            
        };
        console.log('initAccountProfileStatus > status ', status);
        return status;
    }

    initAccountVerifications():UserProfileVerifications {
        console.info('initAccountVerifications');
        let verifications:UserProfileVerifications;
        verifications = {
            email: {
                verified: false,
                verifiedAddress: '',
                verifiedTimestamp: 0,
                attemptsIds: [],
            },
            phone: {
                verified: false,
                verifiedNumber: '',
                verifiedTimestamp: 0,
                attemptsIds: [],            
            },
            residenceAddress: {
                verified: false,
                verifiedAddress: '',
                verifiedTimestamp: 0,
                imageUrl: '',
                verifiedBy: '',
            },
            legalIdentityNumber: {
                verified: false,
                verifiedNumber: '',
                verifiedTimestamp: 0,
                imageUrl: '',
                verifiedBy: '',
            } 
        }
        console.log('initAccountVerifications > verifications > ', verifications);
        return verifications;
    }



}
