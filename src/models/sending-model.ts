
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
            }
        },
        LIVE: {
            ID: 'live',
            STATUS: {
                _LIST: ['vacant', 'holdforpickup', 'transit', 'dropped'],
                VACANT: 'vacant',
                HOLDFORPICKUP: 'holdforpickup',
                TRANSIT: 'transit',
                DROPPED: 'dropped'
            }
        },
        CLOSED: {
            ID: 'closed',
            STATUS: {
                _LIST: ['complete', 'canceledbysender', 'canceledbyoperator', 'vacantexpired'],
                COMPLETE: 'complete',
                CANCELEDBYSENDER: 'canceledbysender',
                CANCELEDBYOPERATOR: 'canceledbyoperator',
                VACANTEXPIRED: 'vacantexpired'
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

            },
            CLOSED: {

            }
        }
    },    
    STAGE_CREATED: {
        REF: '_sendingsCreated/',
        _NODE: 'sendingsCreated',
    },    
    STAGE_LIVE: {
        REF: '_sendingsLive/',
        _NODE: 'sendingsLive',
    },    
    STAGE_CLOSED: {
        REF: 'sendingsClosed/',
        _NODE: 'sendingsClosed',
    },    
}

/**
 *  SENDING MODELS
 */

export class SendingRequest{
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
    _currentStageStatus_?: string;  
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
        vacant: {
            set: boolean,
            timestamp: boolean,
        },
        holdforpickup: {
            set: boolean,
            timestamp: boolean,
        },        
        transit: {
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
        completet: {
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
        vacantexpired: {
            set: boolean,
            timestamp: boolean,
        },                    
    } 
}


