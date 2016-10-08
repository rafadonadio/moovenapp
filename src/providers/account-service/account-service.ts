import { Injectable } from '@angular/core';

import { UserAccount } from '../../shared/interfaces';

declare var firebase: any;

@Injectable()
export class AccountService {

    // FIREBASE DATABASE REFERENCES
    node = '/usersAccount/';
    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    usersAccountRef: any = firebase.database().ref(this.node);


    constructor() {

    }

    /**
     *  SETTERS
     */

    initAccountData(user: any): any {
        var account:UserAccount = {
            providerId: user.providerId,
            email: user.email,
            profileComplete: {
             basic: 0,
             image: 0,
             documentation: 0,
            },
            emailVerified: false,
            emailVerificationAttempts: {},
            phoneVerified: false,
            phoneVerificationAttempts: {},
            lastTosVersionAccepted: '',
            active: 1,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        return account;
    }

    // create database node for user account
    createAccountAndProfileInFirebaseDB(userId: string, account: any, profile: any) {
        var updates = {};
        updates['/usersAccount/' + userId] = account;
        updates['/usersProfile/' + userId] = profile;
        return this.fd.ref().update(updates);
    }



    /**
     *  GETTERS
     */

    // get user account node from firebase database
    getByUid(userId: string): Promise<any> {
        return this.fd.ref(this.node + userId).once('value');
    }

    // get user account email verified node from firebase database
    emailVerifiedRef(userId: string): any {
        return this.fd.ref(this.node + userId + '/emailVerified/');
    }


    /**
     *  HELPERS
     */

    // check if value of account.active is 1
    isActive(account: UserAccount):boolean {
        var isActive:boolean = false;
        if(account.active === 1)
        {
            isActive = true;
        }
        return isActive;
    }

    isEmailVerified (account: UserAccount): boolean {
        return account.emailVerified;
    }

    // check user account.profileComplete.type value is 1
    isProfileComplete(account: UserAccount, profileType: string):boolean {
        var isComplete:boolean = false;
        console.log('profile status > profileType:', profileType, ' > ', account.profileComplete[profileType]);
        if(account.profileComplete[profileType] === 1) {
            isComplete = true;
        }
        return isComplete;
    }

    updateProfileCompleteStatus(userId: string, status: any) {
        var updates = {};
        updates['/usersAccount/' + userId + '/profileComplete/'] = status;
        return this.fd.ref().update(updates);
    }

}
