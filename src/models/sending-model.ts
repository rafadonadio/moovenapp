
/**
 * MODEL CONFIGURATIONS
 */

export const SENDING_CFG = {
    STAGE: {
        CREATED: {
            ID: 'created',
            STATUS: {
                _LIST: ['registered', 'paid', 'enabled'],
                REGISTERED: 'registered',
                PAID: 'paid',
                ENABLED: 'enabled'
            },
            SUMMARY_FIELDS: [
                'pickupAddressStreetShort',
                'pickupAddressNumber',
                'pickupAddressCityShort',
                'dropAddressStreetShort',
                'dropAddressNumber',
                'dropAddressCityShort',
                'objectShortName',
                'timestamp',
                'publicId',
                '_currentStage',
                '_currentStatus',
                '_currentStage_Status',
                'pickupAddressLat',
                'pickupAddressLng',
                'dropAddressLat',
                'dropAddressLng'
            ]
        },
        LIVE: {
            ID: 'live',
            STATUS: {
                _LIST: ['waitoperator', 'gotoperator', 'waitpickup', 'pickedup', 'inroute', 'dropped'],
                WAITOPERATOR: 'waitoperator',
                GOTOPERATOR: 'gotoperator',
                WAITPICKUP: 'waitpickup',
                PICKEDUP: 'pickedup',
                INROUTE: 'inroute',
                DROPPED: 'dropped'
            },
            SUMMARY_FIELDS: [
                'pickupAddressStreetShort',
                'pickupAddressNumber',
                'pickupAddressCityShort',
                'dropAddressStreetShort',
                'dropAddressNumber',
                'dropAddressCityShort',
                'objectShortName',
                'timestamp',
                'publicId',
                '_currentStage',
                '_currentStatus',
                '_currentStage_Status',
                'pickupAddressLat',
                'pickupAddressLng',
                'dropAddressLat',
                'dropAddressLng',
                'pickupTimeFrom',
                'pickupTimeTo',
                'dropTimeFrom',
                'dropTimeTo',
                'objectType',
                'objectImageDownloadUrl',
                'price',
                'routeDistanceKm',
                'objectDeclaredValue'
            ]
        },
        CLOSED: {
            ID: 'closed',
            STATUS: {
                _LIST: ['complete', 'canceledbysender', 'canceledbyoperator', 'gotoperatorexpired'],
                COMPLETE: 'complete',
                CANCELEDBYSENDER: 'canceledbysender',
                CANCELEDBYOPERATOR: 'canceledbyoperator',
                GOTOPERATOREXPIRED: 'gotoperatorexpired'
            }
        }
    },
}

/**
 * SENDING DATA 
 * FIREBASE REFERENCES
 */

export const SENDING_DB = {
    ALL: {
        REF: 'sendings/',
        _NODE: 'sendings',
        _CHILD: {
            IMAGEURL: '/objectImageDownloadUrl/',
            IMAGETEMP: '/objectImageUrlTemp/',
            IMAGENAME: '/objectImageName/',
            FULLPATH: '/objectImageFullPathRef/',
            STAGES: '/_stages/',
            CURRENT_STAGE: '/_currentStage/',
            CURRENT_STATUS: '/_currentStatus/',
            CURRENT_STAGE_STATUS: '/_currentStage_Status/',
            OPERATOR: '/_operator/'
        }
    },
    HASHID: {
        REF: 'sendingsHashid/',
        _NODE: 'sendingsHashid',
    },
    BYUSER: {
        REF: 'userSendings/',
        _NODE: 'userSendings',
        _CHILD: {
            ACTIVE: {
                REF: '/active/',
                _NODE: 'active'
            },
            CLOSED: {
                REF: '/closed/',
                _NODE: 'closed'
            },
            CURRENT_STAGE: {
                REF: '/_currentStage/',
                _NODE: '_currentStage'
            },
            CURRENT_STATUS: {
                REF: '/_currentStatus/',
                _NODE: '_currentStatus'
            },
            CURRENT_STAGE_STATUS: {
                REF: '/_currentStage_Status/',
                _NODE: '_currentStage_Status'
            },
            OPERATOR: {
                REF: '/_operator/',
                _NODE: '_operator'
            },             
        }
    },    
    STAGE_CREATED: {
        REF: '_sendingsCreated/',
        _NODE: 'sendingsCreated',
        _CHILD: {
            CURRENT_STAGE: {
                REF: '/_currentStage/',
                _NODE: '_currentStage'
            },
            CURRENT_STATUS: {
                REF: '/_currentStatus/',
                _NODE: '_currentStatus'
            },
            CURRENT_STAGE_STATUS: {
                REF: '/_currentStage_Status/',
                _NODE: '_currentStage_Status'
            }  
        }          
    },    
    STAGE_LIVE: {
        REF: '_sendingsLive/',
        _NODE: 'sendingsLive',
        _LOCK: {
                REF: '/_locked/',   
                TIMESTAMP: 'timestamp',
                BY_USERID: 'userid'
        },
        _CHILD: {
            CURRENT_STAGE: {
                REF: '/_currentStage/',
                _NODE: '_currentStage'
            },
            CURRENT_STATUS: {
                REF: '/_currentStatus/',
                _NODE: '_currentStatus'
            },
            CURRENT_STAGE_STATUS: {
                REF: '/_currentStage_Status/',
                _NODE: '_currentStage_Status'
            },
            OPERATOR: {
                REF: '/_operator/',
                _NODE: '_operator'
            },
        }         
    },    
    STAGE_CLOSED: {
        REF: 'sendingsClosed/',
        _NODE: 'sendingsClosed',
    },    
}

/**
 *  SENDING MODELS
 */

export class SendingRequestLiveSummary {
    publicId: string;
    timestamp: number;
    price: number;           
    routeDistanceKm: number;
    _currentStage?: string;
    _currentStatus?: string;
    _currentStage_Status?: string;  
    objectShortName: string;
    objectImageDownloadUrl: string;
    objectType: string;
    pickupAddressLat: number;
    pickupAddressLng: number;  
    pickupAddressStreetShort: string;
    pickupAddressNumber: string;
    pickupAddressPostalCode: string;            
    pickupAddressCityShort: string;
    pickupTimeFrom: string;
    pickupTimeTo: string;
    dropAddressLat: number;
    dropAddressLng: number;  
    dropAddressStreetShort: string;
    dropAddressNumber: string;            
    dropAddressCityShort: string;
    dropTimeFrom: string;
    dropTimeTo: string;          
}

export class SendingRequest {
    sendingId: string;
    publicId: string;
    timestamp: number;
    userUid: string;
    price: number;   
    priceMinFareApplied: boolean;               
    routeDistanceMt: number;
    routeDistanceKm: number;
    routeDistanceTxt: string;
    routeDurationMin: number;
    routeDurationTxt: string;
    _stages?: SendingStages;
    _currentStage?: string;
    _currentStatus?: string;
    _currentStage_Status?: string;  
    _operator?: SendingOperator;
    objectShortName: string;
    objectImageSet: boolean;
    objectImageUrlTemp: string;  // deleted once uploaded
    objectImageDownloadUrl: string;
    objectImageName: string;
    objectImageFullPathRef: string;
    objectType: string;
    objectNoValueDeclared: boolean;
    objectDeclaredValue: number;
    pickupAddressSet: boolean;
    pickupAddressIsComplete: boolean;
    pickupAddressUserForcedValidation: boolean;
    pickupAddressPlaceId: string;
    pickupAddressLat: number;
    pickupAddressLng: number;            
    pickupAddressFullText: string;
    pickupAddressLine2: string;
    pickupAddressStreetShort: string;
    pickupAddressStreetLong: string;
    pickupAddressNumber: string;
    pickupAddressPostalCode: string;
    pickupAddressCityAreaShort: string;
    pickupAddressCityAreaLong: string;            
    pickupAddressCityShort: string;
    pickupAddressCityLong: string;
    pickupAddressStateAreaShort: string;
    pickupAddressStateAreaLong: string;            
    pickupAddressStateShort: string;
    pickupAddressStateLong: string;
    pickupAddressCountry: string;
    pickupDate: string;
    pickupTimeFrom: string;
    pickupTimeTo: string;
    pickupPersonName: string;
    pickupPersonPhone: string;
    pickupPersonEmail: string;
    dropAddressSet: boolean;
    dropAddressIsComplete: boolean;
    dropAddressUserForcedValidation: boolean;
    dropAddressPlaceId: string;
    dropAddressLat: number;
    dropAddressLng: number;            
    dropAddressFullText: string;
    dropAddressLine2: string;
    dropAddressStreetShort: string;
    dropAddressStreetLong: string
    dropAddressNumber: string;
    dropAddressPostalCode: string;
    dropAddressCityAreaShort: string;
    dropAddressCityAreaLong: string;            
    dropAddressCityShort: string;
    dropAddressCityLong: string
    dropAddressStateAreaShort: string;
    dropAddressStateAreaLong: string;            
    dropAddressStateShort: string;
    dropAddressStateLong: string;
    dropAddressCountry: string;
    dropDate: string;
    dropTimeFrom: string;
    dropTimeTo: string;
    dropPersonName: string;
    dropPersonPhone: string;
    dropPersonEmail: string;          
}

export class SendingStages {
    _current: string;
    created: StageCreatedNode;
    live: StageLiveNode;
    closed: StageClosedNode;
}

export class StageCreatedNode {
    _current: string;
    set: boolean;
    status: {
        registered: {
            set: boolean,
            timestamp: boolean,
        },
        paid: {
            set: boolean,
            timestamp: boolean,
        }, 
        enabled: {
            set: boolean,
            timestamp: boolean,
        },                
    } 
}

export class StageLiveNode {
    _current: string;
    set: boolean;
    status: {
        waitoperator: {
            set: boolean,
            timestamp: boolean,
        },
        gotoperator: {
            set: boolean,
            timestamp: boolean,
        },        
        waitpickup: {
            set: boolean,
            timestamp: boolean,
        }, 
        pickedup: {
            set: boolean,
            timestamp: boolean,
        },               
        inroute: {
            set: boolean,
            timestamp: boolean,
        },     
        dropped: {
            set: boolean,
            timestamp: boolean,
        },                    
    } 
}

export class StageClosedNode {
    _current: string;
    set: boolean;
    status: {
        completed: {
            set: boolean,
            timestamp: boolean,
        },
        canceledbysender: {
            set: boolean,
            timestamp: boolean,
        },        
        canceledbyoperator: {
            set: boolean,
            timestamp: boolean,
        },     
        gotoperatorexpired: {
            set: boolean,
            timestamp: boolean,
        },                    
    } 
}

export class SendingOperator {
    userId:string;
    displayName:string;
    photoURL:string;
    phone:string;
    email:string;
}

