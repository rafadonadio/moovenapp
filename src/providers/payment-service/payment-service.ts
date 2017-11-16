import { AuthService } from '../auth-service/auth-service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database-deprecated';
import { Injectable } from '@angular/core';

@Injectable()
export class PaymentService {

    constructor(private afDb: AngularFireDatabase,
        private authSrv: AuthService) {}

    // get all user paymentsaccount active sendings Observable
    getAllObs(snapshot:boolean = false, limitToLast:number = 50): FirebaseListObservable<any> {
        let accountId = this.authSrv.fbuser.uid;
        return this.afDb.list(`userPayments/${accountId}`, { 
            preserveSnapshot: snapshot, 
            query: {
                orderByChild: 'timestamp',
                limitToLast: limitToLast
            }
        });
    }  


}