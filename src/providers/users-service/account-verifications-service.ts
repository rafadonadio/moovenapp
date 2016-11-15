import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

import { UserProfileVerifications, USER_DB_REF } from '../../models/user-model';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;

@Injectable()
export class AccountVerificationsService {

    db = firebase.database();
    dbRef = firebase.database().ref();

    constructor(public af:AngularFire) {
    }

    // get fireebase REF for user account email verified node
    getRef_emailVerified(userId: string): firebase.database.Reference {
        return this.dbRef
                .child(ACCOUNT_REF + userId)
                .child(ACCOUNT_REF_CHILDS.PROFILE.VERIFICATIONS.EMAIL.VERIFIED);
    }

    init():UserProfileVerifications {
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
