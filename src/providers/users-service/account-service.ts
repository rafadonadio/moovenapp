import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { UserAccount, UserProfileData, UserProfileStatus, UserProfileVerifications, DB_REF } from '../../models/user-model';

const REF_USER_ACCOUNT = DB_REF.USER_ACCOUNT;

@Injectable()
export class AccountService {

    // FIREBASE DATABASE REFERENCES
    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    usersAccountRef: any = firebase.database().ref(REF_USER_ACCOUNT);

    constructor(public af:AngularFire) {
    }


    /**
     *  WRITE
     */

    // create database node for user account
    writeToFirebaseDb(userId: string, account: UserAccount):Promise<void> {
        var updates = {};
        updates[REF_USER_ACCOUNT + userId] = account;
        return this.fd.ref().update(updates);
    }

    /**
     *  READ
     */

    // get user account node from firebase database
    getByUid(userId: string): Promise<any> {
        return this.fd.ref(REF_USER_ACCOUNT + userId).once('value');
    }

    // get user account email verified node from firebase database
    emailVerifiedRef(userId: string): any {
        return this.fd.ref(REF_USER_ACCOUNT + userId + '/emailVerified/');
    }

    /**
     *  HELPERS
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

    updateProfileCompleteStatus(userId: string, status: any) {
        var updates = {};
        updates[REF_USER_ACCOUNT + userId + '/profileComplete/'] = status;
        return this.fd.ref().update(updates);
    }

    /**
     *  INITS
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
                verifiedTimestamp: 0,
                imageUrl: '',
                verifiedBy: '',
            },
            legalIdentityNumber: {
                verified: false,
                verifiedTimestamp: 0,
                imageUrl: '',
                verifiedBy: '',
            } 
        }
        console.log('initAccountVerifications > verifications > ', verifications);
        return verifications;
    }

}
