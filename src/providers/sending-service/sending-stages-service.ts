import { SENDING_CFG, SendingStages } from '../../models/sending-model';
import { Injectable } from '@angular/core';
import { DateService } from '../date-service/date-service';

const CFG = SENDING_CFG;

@Injectable()
export class SendingStagesService {

    constructor(public dateSrv:DateService) {

    }

    initialize(currentStage:string, timestamp:number):SendingStages
    {
        let stages = this.getInitialized();
        stages = this.updateStageAndStatus(stages, currentStage, timestamp);
        return stages;
    }


    updateStageAndStatus(stages: SendingStages, currentStage:string, timestamp: number, currentStatus:string = '') {
        switch(currentStage) {
            
            case CFG.STAGE.CREATED.ID: 
                    // set current status, if empty created is registered
                    let status = currentStatus!=='' 
                                        ? currentStatus 
                                        : CFG.STAGE.CREATED.STATUS.REGISTERED;
                    // set values
                    stages.created.set = true;
                    stages._current = CFG.STAGE.CREATED.ID;
                    stages.created._current = status;
                    stages.created.status[status].set = true;
                    stages.created.status[status].timestamp = timestamp;
                break;
            case CFG.STAGE.LIVE.ID:

                break;
            case CFG.STAGE.CLOSED.ID:

                break;
        }
        return stages;
    }

    getCurrent(stages:SendingStages) {
        return stages._current;
    }
    getCurrentStatus(stages:SendingStages) {
        let currentStage = stages._current;
        return stages[currentStage]._current;
    }
    getCurrentStageStatus(stages:SendingStages) {
        let currentStage = stages._current;
        let currentStatus = stages[currentStage]._current;
        return currentStage + '_' + currentStatus;
    }    

    /**
     *  INITIALIZE 
     */

    getInitialized():SendingStages {
        let stages:SendingStages = {
            _current: '',
            created: {
                _current: '',
                set: false,
                status: {
                    registered: {
                        set: false,
                        timestamp: false,
                    },
                    paid: {
                        set: false,
                        timestamp: false,
                    }, 
                    enabled: {
                        set: false,
                        timestamp: false,
                    },                
                }              
            },
            live: {
                _current: '',
                set: false,
                status: {
                    vacant: {
                        set: true,
                        timestamp: false,
                    },
                    holdforpickup: {
                        set: true,
                        timestamp: false,
                    },        
                    transit: {
                        set: false,
                        timestamp: false,
                    },     
                    dropped: {
                        set: false,
                        timestamp: false,
                    },                    
                } 
            },
            closed: {
                _current: '',
                set: false,
                status: {
                    completed: {
                        set: false,
                        timestamp: false,
                    },
                    canceledbysender: {
                        set: false,
                        timestamp: false,
                    },        
                    canceledbyoperator: {
                        set: false,
                        timestamp: false,
                    },     
                    vacantexpired: {
                        set: false,
                        timestamp: false,
                    },                    
                } 
            }
        }
        return stages;
    }




}
