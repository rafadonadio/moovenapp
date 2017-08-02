import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';


@Injectable()
export class ConfigService {

    constructor(public afDb: AngularFireDatabase) {}

    // get Terms Of Service
    getCurrentToS(): FirebaseObjectObservable<any> {
        return this.afDb.object(`config/tos/current`, { preserveSnapshot: true });        
    }

}