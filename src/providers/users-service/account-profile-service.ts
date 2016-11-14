import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { UserProfileData, UserProfileStatus, USER_DB_REF, USER_CFG } from '../../models/user-model';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const ACCOUNT_CFG = USER_CFG.ACCOUNT;

@Injectable()
export class AccountProfileService {

    db = firebase.database();
    dbRef = firebase.database().ref();

    constructor(public af:AngularFire) {
    }

    // get account.profile.data from firebase database
    getDataByUid(userId: string): firebase.Promise<any> {
        let child = ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._NODE;
        console.log('getProfileDataByUid > child ', child);
        return this.dbRef
                .child(child)
                .once('value');
    }  

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

    updateStatus(userId:string, profileData: UserProfileData): firebase.Promise<any> {
        console.info('accountProfileStatus > update > start');
        console.group('update');
        // init profile
        let status = this.initStatus();
        // check required fields for basic
        // start in true
        // set false if at least one field is empty
        status.basic.complete = true; //
        ACCOUNT_CFG.PROFILE.REQUIRED_FIELDS.BASIC
            .forEach( function(item, index){
                console.log('foreach > ', item, index);
                if(profileData[item]==='') {
                    status.basic.complete = false;
                }
            }); 
        let updates = {};
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.STATUS._NODE] = status;
        console.groupEnd();
        return this.dbRef.update(updates);
    }



    /**
     *  INITIALIZATION OF ACCOUNT STATUS DATA
     */

    initData(email: string):UserProfileData {
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

    initStatus():UserProfileStatus {
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



}
