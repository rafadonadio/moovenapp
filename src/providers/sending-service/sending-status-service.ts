import { Injectable } from '@angular/core';
import { SendingStageService } from '../sending-service/sending-stage-service';

import { SendingCurrentStatuses, StatusNode } from '../../models/sending-model';

@Injectable()
export class SendingStatusService {

    public LIST = {
        REGISTERED: 'registered',
        VACANT: 'vacant',
        HOLDFORPICKUP: 'holdforpickup',
        TRANSIT: 'transit',
        SUCCESS: 'success',
        ISSUE: 'issue'
    }

    public status:SendingCurrentStatuses;

    constructor(public stageSrv: SendingStageService) {
        this.init();
    }

    getCurrent() {
        return this.status._current;
    }

    updateForCurrentStage(stage:string, timestamp:number):void {        
        console.log('updateForCurrentStage, init value > ', this.status);
        console.log('stage > ', stage);
        switch(stage) {
            case this.stageSrv.STAGE.CREATED:
                    this.status.registered.set = true;
                    this.status.registered.value = true;
                    this.status.registered.timestamp = timestamp;
                    this.status.registered.text = '';
                    this.status._current = this.LIST.REGISTERED;
                break;
            case this.stageSrv.STAGE.PAYMENT:
                    // no status update
                break;
            case this.stageSrv.STAGE.ENABLED:
                    this.status.vacant.set = true;
                    this.status.vacant.value = true;
                    this.status.vacant.timestamp = timestamp;
                    this.status.vacant.text = '';                    
                    this.status._current = this.LIST.VACANT;
                break;
            case this.stageSrv.STAGE.OPERATOR:
                    this.status.holdforpickup.set = true;
                    this.status.holdforpickup.value = true;
                    this.status.holdforpickup.timestamp = timestamp;
                    this.status.holdforpickup.text = '';                 
                    this.status._current = this.LIST.HOLDFORPICKUP;   
                break;
            case this.stageSrv.STAGE.PICKUP:
                    this.status.transit.set = true;
                    this.status.transit.value = true;
                    this.status.transit.timestamp = timestamp;
                    this.status.transit.text = '';                 
                    this.status._current = this.LIST.TRANSIT;                       
                break;
            case this.stageSrv.STAGE.DROP:
                    this.status.success.set = true;
                    this.status.success.value = true;
                    this.status.success.timestamp = timestamp;
                    this.status.success.text = '';                 
                    this.status._current = this.LIST.SUCCESS;                       
                break;          
            case this.stageSrv.STAGE.CANCELED:
            case this.stageSrv.STAGE.UNCONCLUDED:
                // if its canceled or unconcluded, there might be an issue
                    this.status.issue.set = true;
                    this.status.issue.value = true;
                    this.status.issue.timestamp = timestamp;
                    this.status.issue.text = '';                 
                    this.status._current = this.LIST.ISSUE;                                       
                break;                                                                                                                      
        }
        console.log('updateForCurrentStage, end > ', this.status);
    }


    /**
     *  INIT
     */

    init() {
        let statuses = {
            _current: '',
            registered: this.getInitNode(),
            vacant: this.getInitNode(),
            holdforpickup: this.getInitNode(),
            transit: this.getInitNode(),
            success: this.getInitNode(),
            issue: this.getInitNode()
        }
        console.log('init > done ', statuses);
        this.status = statuses;
    }

    private getInitNode():any {
        return { 
                set: false, 
                value: false, 
                timestamp: 0,
                text: '' 
            }
    }

}
