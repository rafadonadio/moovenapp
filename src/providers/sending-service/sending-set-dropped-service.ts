import { SendingDbService } from './sending-db-service';
import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class SendingSetDroppedService{

    private sendingId:string;
    private userId:string;
    private taskCF:any;
    private dbRef: firebase.database.Reference;

    constructor(private dbSrv: SendingDbService) {}

    run(sendingId:string, userId:string): Promise<any> {
        this.setDbRef();
        this.sendingId = sendingId;
        this.userId = userId;
        return this.write();   
    }

    private write() {
        this.setTaskCF();
        return new Promise((resolve, reject) => {
            // write cf task
            let updates = {};        
            let taskKey = this.dbSrv.newSendingTaskKey();
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
            userId: this.userId,
            task: 'set_dropped',
            timestamp: this.dbSrv.getTimestamp(),
            origin: 'app'
        }
    }

    private setDbRef() {
        this.dbRef = this.dbSrv.getDatabaseRef();
        console.log('init dbRef', this.dbRef);
    }

}
