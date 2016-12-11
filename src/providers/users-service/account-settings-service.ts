import { USER_DB_REF, UserAccountSettings } from '../../models/user-model';
import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;

@Injectable()
export class AccountSettingsService {

    dbRef = firebase.database().ref();

    constructor(public af: AngularFire) {
    }

    setInitValuesInDB(userId:string):firebase.Promise<any> {
        let settings: UserAccountSettings;
        settings = {
            notifications: {
                localPush: true,
                email: false
            }
        };
        // save to database
        let updates = {};
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.SETTINGS._NODE] = settings;
        return this.dbRef.update(updates);
    }

    checkConsistency(settings: any) {
        console.log(settings); 
        if(settings) {
            
        }
    }





}