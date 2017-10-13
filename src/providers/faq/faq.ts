import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FaqProvider {

    constructor(private afs: AngularFirestore) {}

    getAll(): AngularFirestoreCollection<any> {
        return this.afs.collection<any>('publicFaqs', 
                        ref => ref.orderBy('order', 'asc'));
    }

}
