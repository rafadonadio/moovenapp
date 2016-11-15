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




}
