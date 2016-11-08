import { Injectable } from '@angular/core';

import { SendingStages, StageNode } from '../../shared/sending-interface';
import { DateService } from '../date-service/date-service';

@Injectable()
export class SendingStageService {

    public stage = {
        CREATED: 'created',
        PAYMENT: 'payment',
        BONUS: 'bonus',
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


    init() {
        let initNode:StageNode = { 
                value:false, 
                timestamp:0,
                text:'' 
            };
        let stages = {
            created: initNode,
            payment: initNode,
            bonus: initNode,
            enabled: initNode,
            operator: initNode,
            pickup: initNode,
            drop: initNode,
            canceled: initNode,
            unconcluded: initNode
        }
        this.stages = stages;
    }

    get():SendingStages {
        return this.stages;
    }

    update(stages:SendingStages, newStage:string):SendingStages {
        switch(newStage) {
            case this.stage.CREATED:
                    stages.created.value = true;
                    stages.created.timestamp = this.dateSrv.getTimestamp();
                    stages.created.text = '';
                break;
            case this.stage.PAYMENT:

                break;
            case this.stage.BONUS:

                break;
            case this.stage.ENABLED:

                break;
            case this.stage.OPERATOR:

                break;
            case this.stage.PICKUP:

                break;
            case this.stage.DROP:

                break;          
            case this.stage.CANCELED:

                break;
            case this.stage.UNCONCLUDED:

                break;                                                                                                                      
        }
        return stages;
    }
}
