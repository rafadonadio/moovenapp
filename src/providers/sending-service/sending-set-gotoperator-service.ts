import { SendingDbService } from './sending-db-service';
import { SendingRequest } from '../../models/sending-model';
import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class SendingSetGotoperatorService{

    private sendingId:string;
    private userId:string;
    private taskCF:any;
    private lockNode:any;
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
        this.setLockNode();
        return new Promise((resolve, reject) => {
            // write cf task
            let updates = {};        
            let taskKey = this.dbSrv.newSendingTaskKey();
            // update lockNode
            updates[`_sendingsLive/${this.sendingId}/_locked`] = this.lockNode;
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
            task: 'set_gotoperator',
            timestamp: this.dbSrv.getTimestamp(),
            origin: 'app'
        }
    }

    private setLockNode() {
        this.lockNode = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            userId: this.userId,
            taken: true
        }
    }

    private setDbRef() {
        this.dbRef = this.dbSrv.getDatabaseRef();
        console.log('init dbRef', this.dbRef);
    }

}