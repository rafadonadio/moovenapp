import { Injectable } from '@angular/core';
import { SENDING_CFG, SendingRequest } from '../../models/sending-model';

const CFG = SENDING_CFG;

@Injectable()
export class SendingRequestService {

    constructor() {
    }

    getSummary(sending:SendingRequest, stage: string) {
        console.info('getSummary > start');
        let fieldsList = [];
        let summary:any = {};
        switch(stage){
            case CFG.STAGE.CREATED.ID:
                fieldsList = CFG.STAGE.CREATED.SUMMARY_FIELDS;
                break;
            case CFG.STAGE.LIVE.ID:
                fieldsList = CFG.STAGE.LIVE.SUMMARY_FIELDS;
                break;
        }   
        // iterate fields
        for(let index in fieldsList) {
            let field = fieldsList[index];
            summary[field] = sending[field];
        }
        console.log('getSummary for stage '+stage+'> done > ', summary);
        return summary;
    }




}
