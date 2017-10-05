import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class SendingSetDroppedService{

    private sendingId:string;
    private userId:string;
    private taskCF:any;
    private dbRef: firebase.database.Reference;

    constructor() {
        this.dbRef = firebase.database().ref();
    }

    run(sendingId:string, userId:string): Promise<any> {
        this.sendingId = sendingId;
        this.userId = userId;
        return this.write();   
    }

    private write() {
        this.setTaskCF();
        return new Promise((resolve, reject) => {
            // write cf task
            let updates = {};        
            let taskKey = this.dbRef.child('sendingsTask/').push().key;
            // create task
            updates[`sendingsTask/${taskKey}`] = this.taskCF;
            // write
            this.dbRef.update(updates)
                .then((result) => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    // set task for Cloud Functions
    private setTaskCF() {
        this.taskCF = {
            sendingId: this.sendingId,
            operatorId: this.userId,
            task: 'set_dropped',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            origin: 'app',
            setBy: 'operator',
        }
    }

}
