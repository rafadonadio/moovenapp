import { Injectable } from '@angular/core';

import { AuthService } from '../auth-service/auth-service';
import { AccountServiceOld } from '../users-service/account-service';
import { AccountEmailVerificationService } from '../users-service/account-email-verification-service';

import { UserAccount, USER_DB_REF } from '../../models/user-model';
import firebase from 'firebase';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;

@Injectable()
export class UsersService {

    dbRef = firebase.database().ref();

    constructor(public authSrv: AuthService,
        public accountSrv: AccountServiceOld,
        public emailVerification: AccountEmailVerificationService) {
    }

    // get authenticated user
    getUser(): firebase.User {
        return this.authSrv.fbuser;
    }

    // Reload authenticated user data
    reloadUser(): firebase.Promise<any> {
        let user = this.getUser();
        return user.reload();;
    }

    // get user account data
    getAccount():firebase.Promise<any> {
        let user = this.getUser();
        return this.dbRef
                .child(ACCOUNT_REF + user.uid)
                .once('value');;
    }

    getAccountProfileData(): firebase.Promise<any> {
        let user = this.getUser();
        return this.accountSrv.getProfileDataByUid(user.uid);
    }

    getAccountSettings(): firebase.Promise<any> {
        let user = this.getUser();
        // return this.accountSrv.getSettingsByUid(user.uid);
        let child = ACCOUNT_REF + user.uid + ACCOUNT_REF_CHILDS.SETTINGS._NODE;
        return this.dbRef   
                .child(child)
                .once('value');
    }

    // get user account data
    getAccountProfileDataByUid(uid:string): firebase.Promise<any> {
        return this.accountSrv.getProfileDataByUid(uid);
    }    


}
