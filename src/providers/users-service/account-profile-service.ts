import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { USER_CFG, USER_DB_REF, UserAccountProfile, UserProfileData, UserProfileStatus, UserProfileVerifications } from '../../models/user-model';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const ACCOUNT_CFG = USER_CFG.ACCOUNT;

@Injectable()
export class AccountProfileService {

    db = firebase.database();
    dbRef = firebase.database().ref();

    constructor(public af:AngularFire) {
    }

    /**
     *  GET DATABASE REFERENCE
     */

    // get fireebase REF for user account email verified node
    getRef_emailVerification(userId: string): firebase.database.Reference {
        return this.dbRef
                .child(ACCOUNT_REF + userId)
                .child(ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.VERIFIED);
    }

    /**
     *  READ
     */

    // get account.profile.data from firebase database
    getDataByUid(userId: string): firebase.Promise<any> {
        let child = ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._NODE;
        return this.dbRef
                .child(child)
                .once('value');
    }  

    getVerificationsByUid(userid:string): firebase.Promise<any> {
        let child = ACCOUNT_REF + userid + ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS._NODE;
        return this.dbRef   
                .child(child)
                .once('value');
    }

    /**
     *  WRITE
     */

    // update user profile (updates only the included nodes)
    updateData(userId: string, data: any): firebase.Promise<any> {
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

    // update user profile (updates only the included nodes)
    updateNames(userId: string, data: any): firebase.Promise<any> {
        var profileData:any = {
            firstName: data.firstName,
            lastName: data.lastName,
        };
        var updates = {};
        for(let field in profileData) {
            updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._FIELD + field] = profileData[field];
        }
        return this.dbRef.update(updates);
    }

    updateStatus(userId:string, profile: UserAccountProfile ): firebase.Promise<any> {
        console.info('accountProfileStatus > update > start');
        console.group('update');
        // init status object
        let status = this.initStatus();
        status = this.setFieldsCompleteStatus(status, profile.data);
        status = this.setVerificationsCompleteStatus(status, profile.verifications);
        let updates = {};
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.STATUS._NODE] = status;
        console.groupEnd();
        return this.dbRef.update(updates);
    }

    /**
     *  HELPERS
     */

    private setFieldsCompleteStatus(profileStatus:UserProfileStatus, profileData:UserProfileData):UserProfileStatus {
        // iterate each profile type
        let notFilled = []; 
        for(let key in ACCOUNT_CFG.PROFILE.LIST) {
            let typeUpper = key;
            let typeLower = ACCOUNT_CFG.PROFILE.LIST[key];
            let requiredFields = ACCOUNT_CFG.PROFILE.REQUIRED_FIELDS[typeUpper];
            let notFound = [];
            // set false if at least one field is empty
            profileStatus[typeLower].fieldsComplete = true; //
            requiredFields.forEach( function(item, index){
                    //console.log('foreach > ', item, index);
                    // if at least one is empty, complete flag stays false
                    if(profileData[item]==='') {
                        profileStatus[typeLower].fieldsComplete = false;
                        notFound.push(item);
                    }
                }); 
           notFilled[typeLower] = notFound;     
        }
        console.log('setFieldsCompleteStatus > notFilled > ', notFilled);
        return profileStatus;
    }

    private setVerificationsCompleteStatus(profileStatus:UserProfileStatus, accountVerifications:UserProfileVerifications):UserProfileStatus {
        // iterate each profile type
        let notVerified = []; 
        for(let key in ACCOUNT_CFG.PROFILE.LIST) {
            let typeUpper = key;
            let typeLower = ACCOUNT_CFG.PROFILE.LIST[key];
            let requiredVerifications = ACCOUNT_CFG.PROFILE.REQUIRED_VERIFICATIONS[typeUpper];
            let unverified = [];
            // set false if at least one field is empty
            profileStatus[typeLower].verificationsComplete = true; //
            requiredVerifications.forEach( function(item, index){
                    //console.log('foreach > ', item, index);
                    // if at least one is false, complete flag is false
                    if(accountVerifications[item].verified===false) {
                        profileStatus[typeLower].verificationsComplete = false;
                        unverified.push(item);
                    }
                }); 
           notVerified[typeLower] = unverified;     
        }
        console.log('setVerificationsCompleteStatus > notVerified > ', notVerified);
        return profileStatus;
    }    

    /**
     *  INITIALIZATION OF ACCOUNT STATUS DATA
     */

    initData(email: string):UserProfileData {
        console.info('initAccountProfileData');
        let data:UserProfileData = {
            email: email,
            emailOnChange: false,
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

    initStatus():UserProfileStatus {
        console.info('initAccountProfileStatus');
        let status:UserProfileStatus;
        status = {
            basic: {
                fieldsComplete: false,
                verificationsComplete:false
            },
            sender: {
                fieldsComplete: false,
                verificationsComplete:false
            },            
            operator: {
                fieldsComplete: false,
                verificationsComplete:false
            },            
        };
        console.log('initAccountProfileStatus > status ', status);
        return status;
    }

    initVerifications():UserProfileVerifications {
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
