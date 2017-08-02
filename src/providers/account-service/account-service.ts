import { UserAccount, UserProfileData } from '../../models/user-model';
import { AuthService } from '../auth-service/auth-service';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

import firebase from 'firebase';

@Injectable()
export class AccountService {

    constructor(public afDb: AngularFireDatabase,
        private authSrv: AuthService) {}
    
    /**
     *  UPDATE
     */

    updatePhoto(downloadURL:string, fullPath:string):firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        let updates = {};
        updates[`userAccount/${accountId}/profile/data/photoURL`] = downloadURL;
        updates[`userAccount/${accountId}/profile/data/photoPath`] = fullPath;
        return firebase.database().ref().update(updates);
    }

    updateProfileData(profileData: UserProfileData): firebase.Promise<any> {
        let accountId = this.authSrv.fbuser.uid;
        let updates = {};
        updates[`userAccount/${accountId}/profile/data`] = profileData;
        return firebase.database().ref().update(updates);
    }

    /**
     *  GET
     */

    // get account Observable
    getObs(snapshot:boolean = false): FirebaseObjectObservable<any> {
        // console.log('uid', this.authSrv.fbuser);
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.object(`userAccount/${accountId}`, { preserveSnapshot: snapshot });
    }  

    /**
     *  ACCOUNT SIMPLE CHECKERS
     */

    exist(): Promise<{getId:boolean, exist:boolean}> {
        let result = {
            getId: false,
            exist: false,
        }
        // get user id or die
        let accountId = this.authSrv.fbuser ? this.authSrv.fbuser.uid : null;
        if(!accountId) {
            // die
            return Promise.resolve(result);
        }
        result.getId = true;
        // get account
        return new Promise((resolve, reject) => {
            firebase.database().ref(`userAccount/${accountId}`).once('value')
                .then(snap => {
                    console.log('account', snap.val());
                    result.exist = snap.val() ? true : false;
                    resolve(result);
                })
                .catch(error => {
                    console.log(error);
                    resolve(result);
                });
        });  
    }

    // is Account Active
    isActive(account:UserAccount):boolean {
        return account.active;
    }
    // is Account Basic Profile Complete
    isBasicProfileComplete(account: UserAccount):boolean {
        return account.profile.status.basic.fieldsComplete;
    }
    // is Account Basic Profile Verified
    isBasicProfileVerified(account: UserAccount):boolean {
        return account.profile.status.basic.verificationsComplete;
    }    


}