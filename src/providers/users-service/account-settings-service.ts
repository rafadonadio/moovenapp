import { USER_CFG, USER_DB_REF, UserAccount, UserAccountSettings } from '../../models/user-model';
import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

const ACCOUNT_REF = USER_DB_REF.USER_ACCOUNT;
const ACCOUNT_REF_CHILDS = USER_DB_REF._CHILDS;
const DEFAULT_VALUES = USER_CFG.ACCOUNT.SETTINGS.DEFAULT_VALUES;

@Injectable()
export class AccountSettingsService {

    dbRef = firebase.database().ref();

    constructor(public af: AngularFire) {
    }

    settingsExistInAccount(account:UserAccount) {
        return account.hasOwnProperty("settings");
    }

    setInitValuesInDB(userId:string):firebase.Promise<any> {
        let settings: UserAccountSettings;
        settings = this.init();
        // save to database
        return this.updateInDb(userId, settings);
    }

    completeMissingValuesInDB(userId:string, settings:any) {
        // COMPLETE NOTIFICATIONS
        if(!settings.hasOwnProperty("notifications")) {
            settings.notifications = {
                localPush: DEFAULT_VALUES.NOTIFICATIONS.LOCAL_PUSH,
                email: DEFAULT_VALUES.NOTIFICATIONS.EMAIL
            }
        }else if(!settings.notifications.hasOwnProperty("localPush")){
            settings.notifications.localPush = DEFAULT_VALUES.NOTIFICATIONS.LOCAL_PUSH
        }else if(!settings.notifications.hasOwnProperty("email")) {
            settings.notifications.email = DEFAULT_VALUES.NOTIFICATIONS.EMAIL
        }
        // OTHER 
        // ...
        // UPDATE
        return this.updateInDb(userId, settings);
    }

    checkConsistency(settings: any):boolean {
        let consistent = true;
        // check notifications
        if(!settings.hasOwnProperty("notifications")
            || !settings.notifications.hasOwnProperty("localPush")
                || !settings.notifications.hasOwnProperty("email")) 
        {
            consistent = false;
        }
        return consistent;
    }

    init():UserAccountSettings {
        let settings = {
            notifications: {
                localPush: DEFAULT_VALUES.NOTIFICATIONS.LOCAL_PUSH,
                email: DEFAULT_VALUES.NOTIFICATIONS.EMAIL
            }
        } 
        return settings;
    }

    updateNotificationsInDB(userId:string, notifications: any):firebase.Promise<any> {
        let updates = {};
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.SETTINGS.NOTIFICATIONS._NODE] = notifications;
        return this.dbRef.update(updates);
    }

    private updateInDb(userId: string, settings: UserAccountSettings):firebase.Promise<any> {
        let updates = {};
        updates[ACCOUNT_REF + userId + ACCOUNT_REF_CHILDS.SETTINGS._NODE] = settings;
        return this.dbRef.update(updates);        
    }

}