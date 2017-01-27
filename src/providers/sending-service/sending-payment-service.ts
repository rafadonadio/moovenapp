import { MercadopagoService } from '../payment-gateways/mercadopago-service';
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
        public stagesSrv: SendingStagesService,
        public mpagoSrv: MercadopagoService) {}

    // run payment
    checkout() {
        console.info('checkout > start');
        // aux
        let payment = {
            id:'',
            transaction: '',
            status: '',
            completed: false
        }
        return new Promise((resolve, reject) => {
            this.mpagoSrv.createPayment()
                .then((result) => {
                    //
                    console.log('processPayment > ', result);
                    payment.id = '55555555555';
                    payment.transaction = '666666666666';
                    payment.status = 'pending';
                    payment.completed = false;
                    resolve(payment);
                })
                .catch((error) => {
                    console.log('processPayment', error);
                    reject(error);
                }); 
        });         
    }

    guessPaymentTypeMP(input:string) {
        return this.mpagoSrv.guessPaymentMethod(input);
    }

}

