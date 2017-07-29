import { UserAccount } from '../../models/user-model';
import { AuthService } from '../auth-service/auth-service';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';

import firebase from 'firebase';

@Injectable()
export class AccountService {

    constructor(public afDb: AngularFireDatabase,
        private authSrv: AuthService) {}
    

    // get account Observable
    getObs(snapshot:boolean = false): FirebaseObjectObservable<any> {
        // console.log('uid', this.authSrv.fbuser);
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.object(`/userAccount/${accountId}`, { preserveSnapshot: snapshot });
    }  

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

    /**
     *  ACCOUNT SIMPLE CHECKERS
     */

    isActive(account:UserAccount):boolean {
        return account.active;
    }



}