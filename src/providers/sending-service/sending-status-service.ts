import { Injectable } from '@angular/core';
import { SendingStageService } from '../sending-service/sending-stage-service';

import { SendingCurrentStatuses, StatusNode } from '../../shared/sending-interface';

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

    public statuses:SendingCurrentStatuses;

    constructor(public stageSrv: SendingStageService) {
        this.init();
    }

    getCurrent() {
        return this.statuses._current;
    }

    updateForCurrentStage(stage:string, timestamp:number):void {        
        console.log('updateForCurrentStage, init value > ', this.statuses);
        console.log('stage > ', stage);
        switch(stage) {
            case this.stageSrv.STAGE.CREATED:
                    this.statuses.registered.set = true;
                    this.statuses.registered.value = true;
                    this.statuses.registered.timestamp = timestamp;
                    this.statuses.registered.text = '';
                    this.statuses._current = this.LIST.REGISTERED;
                break;
            case this.stageSrv.STAGE.PAYMENT:
                    // no status update
                break;
            case this.stageSrv.STAGE.ENABLED:
                    this.statuses.vacant.set = true;
                    this.statuses.vacant.value = true;
                    this.statuses.vacant.timestamp = timestamp;
                    this.statuses.vacant.text = '';                    
                    this.statuses._current = this.LIST.VACANT;
                break;
            case this.stageSrv.STAGE.OPERATOR:
                    this.statuses.holdforpickup.set = true;
                    this.statuses.holdforpickup.value = true;
                    this.statuses.holdforpickup.timestamp = timestamp;
                    this.statuses.holdforpickup.text = '';                 
                    this.statuses._current = this.LIST.HOLDFORPICKUP;   
                break;
            case this.stageSrv.STAGE.PICKUP:
                    this.statuses.transit.set = true;
                    this.statuses.transit.value = true;
                    this.statuses.transit.timestamp = timestamp;
                    this.statuses.transit.text = '';                 
                    this.statuses._current = this.LIST.TRANSIT;                       
                break;
            case this.stageSrv.STAGE.DROP:
                    this.statuses.success.set = true;
                    this.statuses.success.value = true;
                    this.statuses.success.timestamp = timestamp;
                    this.statuses.success.text = '';                 
                    this.statuses._current = this.LIST.SUCCESS;                       
                break;          
            case this.stageSrv.STAGE.CANCELED:
            case this.stageSrv.STAGE.UNCONCLUDED:
                // if its canceled or unconcluded, there might be an issue
                    this.statuses.issue.set = true;
                    this.statuses.issue.value = true;
                    this.statuses.issue.timestamp = timestamp;
                    this.statuses.issue.text = '';                 
                    this.statuses._current = this.LIST.ISSUE;                                       
                break;                                                                                                                      
        }
        console.log('updateForCurrentStage, end > ', this.statuses);
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
        this.statuses = statuses;
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
