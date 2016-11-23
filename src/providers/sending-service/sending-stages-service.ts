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
        // init
        let stages = this.getInitialized();
        let currentStatus = CFG.STAGE.CREATED.STATUS.REGISTERED;
        stages._current = currentStage;     
        stages[currentStage].set = true;
        stages[currentStage]._current = currentStatus;
        stages[currentStage].status[currentStatus].set = true;
        stages[currentStage].status[currentStatus].timestamp = timestamp;
        return stages;
    }

    /**
     *  STAGE UPDATES
     */

    updateStageTo(stages:SendingStages, currentStage:string, currentStatus:string, timestamp:number):Promise<any> {
        return new Promise((resolve) => {
            let newStages:SendingStages;
            // set stage
            stages._current = currentStage;     
            stages[currentStage].set = true;
            // set status
            stages[currentStage]._current = currentStatus;
            stages[currentStage].status[currentStatus].set = true;
            stages[currentStage].status[currentStatus].timestamp = timestamp;
            newStages = stages;      
            console.log('updateStageTo > result > ', newStages);
            resolve(stages);
        });      
    }


    /**
     *  GET VALUES FROM STAGES
     */

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
                    waitoperator: {
                        set: false,
                        timestamp: false,
                    },
                    gotoperator: {
                        set: false,
                        timestamp: false,
                    },                    
                    waitpickup: {
                        set: false,
                        timestamp: false,
                    },
                    pickedup: {
                        set: false,
                        timestamp: false,
                    },                            
                    inroute: {
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
                    gotoperatorexpired: {
                        set: false,
                        timestamp: false,
                    },                    
                } 
            }
        }
        return stages;
    }




}
