import { Injectable } from '@angular/core';
import {
    SENDING_CFG,
    SendingRequest,
    SendingStages
} from '../../models/sending-model';
import { SendingDbService } from '../sending-service/sending-db-service';
import { SendingStagesService } from '../sending-service/sending-stages-service';


// CFG
const CFG = SENDING_CFG;

@Injectable()
export class SendingPaymentService {

    constructor(public dbSrv: SendingDbService,
        public stagesSrv: SendingStagesService) {}

    // run payment
    checkout() {
        console.info('checkout > start');
        // aux
        let steps = {
            payment: false,
            insertDb: false
        };
        return new Promise((resolve, reject) => {
            this.processPayment()
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    console.log('processPayment', error);
                    reject(error);
                }); 
        });         
    }

    // run payment
    private processPayment() {
        let payment = {
            id:'',
            transaction: '',
            status: '',
            completed: false
        }
        return new Promise((resolve, reject) => {

            // ******* simulate ********
            setTimeout(() => {
                console.log('payment ok!, continue');
                payment.id = '5484585824';
                payment.transaction = 'oiu6n43uin6y34c3h5f32fh6';
                payment.status = 'pending';
                payment.completed = true;
                resolve(payment);
            },3000);             

        });
    }

}