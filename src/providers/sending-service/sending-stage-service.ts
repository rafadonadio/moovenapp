import { Injectable } from '@angular/core';

import { SendingStages, StageNode } from '../../models/sending-model';
import { DateService } from '../date-service/date-service';

@Injectable()
export class SendingStageService {

    public STAGE = {
        CREATED: 'created',
        PAYMENT: 'payment',
        ENABLED: 'enabled',
        OPERATOR: 'operator',
        PICKUP: 'pickup',
        DROP: 'drop',
        CANCELED: 'canceled',
        UNCONCLUDED: 'unconcluded'
    }
    public stages:SendingStages;

    constructor(public dateSrv:DateService) {
        this.init();
    }


    populateStage(newStage:string, timestamp:number, data:any = {}) {
        let stageNode:StageNode = {
            value: true, 
            timestamp: timestamp,
            data: data,
            text: this.getMessageForStage(newStage) 
        } 
        this.stages[newStage] = stageNode;
    }

    init() {
        let stages = {
            created: this.getInitNode(),
            payment: this.getInitNode(),
            enabled: this.getInitNode(),
            operator: this.getInitNode(),
            pickup: this.getInitNode(),
            drop: this.getInitNode(),
            canceled: this.getInitNode(),
            unconcluded: this.getInitNode()
        }
        this.stages = stages;
    }

    private getInitNode():any {
        return { 
                value: false, 
                timestamp: 0,
                text: '',
                data: {} 
            };
    }

    private getMessageForStage(stage:string):string {
        let message = '';
        switch(stage) {
            case this.STAGE.CREATED:
                    message = '';
                break;
            case this.STAGE.PAYMENT:
                    message = '';
                break;
            case this.STAGE.ENABLED:
                    message = '';
                break;
            case this.STAGE.OPERATOR:
                    message = '';
                break;
            case this.STAGE.PICKUP:
                    message = '';
                break;
            case this.STAGE.DROP:
                    message = '';
                break;          
            case this.STAGE.CANCELED:
                    message = '';
                break;
            case this.STAGE.UNCONCLUDED:
                    message = '';
                break;                                                                                                                      
        }
        return message;
    }

}
