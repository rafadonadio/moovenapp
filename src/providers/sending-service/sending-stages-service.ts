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
                        timestamp: 0,
                    },
                    paid: {
                        set: false,
                        timestamp: 0,
                    }, 
                    enabled: {
                        set: false,
                        timestamp: 0,
                    },                
                }              
            },
            live: {
                _current: '',
                set: false,
                status: {
                    waitoperator: {
                        set: false,
                        timestamp: 0,
                    },
                    gotoperator: {
                        set: false,
                        timestamp: 0,
                    },                    
                    waitpickup: {
                        set: false,
                        timestamp: 0,
                    },
                    pickedup: {
                        set: false,
                        timestamp: 0,
                    },                            
                    inroute: {
                        set: false,
                        timestamp: 0,
                    },     
                    dropped: {
                        set: false,
                        timestamp: 0,
                    },                    
                } 
            },
            closed: {
                _current: '',
                set: false,
                status: {
                    completed: {
                        set: false,
                        timestamp: 0,
                    },
                    canceledbysender: {
                        set: false,
                        timestamp: 0,
                    },        
                    canceledbyoperator: {
                        set: false,
                        timestamp: 0,
                    },     
                    gotoperatorexpired: {
                        set: false,
                        timestamp: 0,
                    },                    
                } 
            }
        }
        return stages;
    }




}
