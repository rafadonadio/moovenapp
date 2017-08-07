import { Injectable } from '@angular/core';

import { AuthService } from '../auth-service/auth-service';
import { AccountEmailVerificationService } from '../users-service/account-email-verification-service';

import { USER_DB_REF } from '../../models/user-model';
import firebase from 'firebase';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;

@Injectable()
export class UsersService {

    dbRef = firebase.database().ref();

    constructor(public authSrv: AuthService,
        public emailVerification: AccountEmailVerificationService) {
    }

    getUser(): firebase.User {
        return this.authSrv.fbuser;
    }

    getAccountProfileData(): firebase.Promise<any> {
        let user = this.getUser();
        return this.getProfileDataByUid(user.uid);
    }

    getAccountProfileDataByUid(uid:string): firebase.Promise<any> {
        return this.getProfileDataByUid(uid);
    }    

    getProfileDataByUid(userId: string): firebase.Promise<any> {
        let child = ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.PROFILE.DATA._NODE;
        return this.dbRef
                .child(child)
                .once('value');        
    }  

}
