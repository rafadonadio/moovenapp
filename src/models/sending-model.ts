
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
                PAID: 'paid', // paid done, not yet confirmed
                ENABLED: 'enabled', // payment confirmed
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
                _LIST: ['waitoperator', 'gotoperator', 'waitpickup', 'pickedup', 'inroute', 'dropped','notificationsexpired'],
                WAITOPERATOR: 'waitoperator',
                GOTOPERATOR: 'gotoperator',
                WAITPICKUP: 'waitpickup',
                PICKEDUP: 'pickedup',
                INROUTE: 'inroute',
                DROPPED: 'dropped',
                NOTIFICATIONSEXPIRED: 'notificationsexpired'
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
                _LIST: ['complete', 'canceledbysender', 'canceledbyoperator', 'gotoperatorexpired','payexpired'],
                COMPLETE: 'complete',
                CANCELEDBYSENDER: 'canceledbysender',
                CANCELEDBYOPERATOR: 'canceledbyoperator',
                GOTOPERATOREXPIRED: 'gotoperatorexpired',
                PAYEXPIRED: 'payexpired' 
            }
        }
    },
    PRICE_LIST: {
        BASIC: {
            MIN_FARE: {
                VALUE: 100
            },
            PER_DISTANCE: [
                { ID:'0-25', GRTR_THAN:0, SMLR_OR_EQUAL:25, VALUE_PER_KM: 10 },
                { ID:'25-50', GRTR_THAN:25, SMLR_OR_EQUAL:50, VALUE_PER_KM: 8 },
                { ID:'50-10000', GRTR_THAN:50, SMLR_OR_EQUAL:10000, VALUE_PER_KM: 5 },
            ]                 
        }
    }
}

export const NOTIFICATIONS_CFG = {
        'created_registered': {
            NOTIFY: false,
            TITLE: {
                'es': 'Servicio registrado',
            },
            MSG: {
                'es': 'Registrado con ID #{PUBLICID}, el {DATE}',
            },
            ICON: 'checkmark'
        },
        'created_paid': {
            NOTIFY: true,
            TITLE: {
                'es': 'Pago aceptado',
            },
            MSG: {
                'es': 'Se debitaron ${PRICE} de tu cuenta',
            },
            ICON: 'card'
        },
        'created_enabled': {    
            NOTIFY: true,
            TITLE: {
                'es': 'Servicio habilitado',
            },
            MSG: {
                'es': 'Servicio habilitado para ser tomado por un operador',
            },
            ICON: 'send'
        },
        'live_waitoperator': {
            NOTIFY: false,
            TITLE: {
                'es': 'Esperando Operador',
            },
            MSG: {
                'es': 'Aguardando ser tomado por Operador',
            },
            ICON: 'time'
        },
        'live_gotoperator': {
            NOTIFY: true,
            TITLE: {
                'es': 'Operador confirmado',
            },
            MSG: {
                'es': 'El operador {OPERATOR_NAME}, fue confirmado el {DATE}',
            },
            ICON: 'person'
        },
        'live_waitpickup': {
            NOTIFY: true,
            TITLE: {
                'es': 'Código de seguridad: Retiro',
            },
            MSG: {
                'es': 'El operador debe informar: {CODE}',
            },
            ICON: 'time'
        },
        'live_pickedup': {
            NOTIFY: true,
            TITLE: {
                'es': 'Servicio retirado',
            },
            MSG: {
                'es': 'Retiro informado el {DATE}',
            },
            ICON: 'checkmark'
        },
        'live_inroute': {
            NOTIFY: true,
            TITLE: {
                'es': 'Código de seguridad: Entrega',
            },
            MSG: {
                'es': 'Informar al operador: {CODE}',
            },
            ICON: 'time'
        },
        'live_dropped': {
            NOTIFY: true,
            TITLE: {
                'es': 'Servicio entregado',
            },
            MSG: {
                'es': 'Entrega informada el {DATE}',
            },
            ICON: 'checkmark'
        },
        'closed_complete': {
            NOTIFY: false,
            TITLE: {
                'es': 'Servicio completado',
            },
            MSG: {
                'es': 'El servicio ha sido completado el {DATE}',
            },
            ICON: 'checkmark'
        },
        'closed_canceledbysender': {
            NOTIFY: true,
            TITLE: {
                'es': 'Cancelado por Solicitante',
            },
            MSG: {
                'es': 'Has canceledo el servicio el {DATE}',
            },
            ICON: 'close'
        },
        'closed_canceledbyoperator': {
            NOTIFY: true,
            TITLE: {
                'es': 'Cancelado por Operador',
            },
            MSG: {
                'es': 'Informó cancelación el {DATE}',
            },
            ICON: 'close'
        },
        'closed_gotoperatorexpired': {
            NOTIFY: true,
            TITLE: {
                'es': 'Servicio expiró',
            },
            MSG: {
                'es': 'El servicio no fue tomado y expiró el {DATE}',
            },
            ICON: 'close'
        },
    };

/**
 * SENDING DATA 
 * FIREBASE REFERENCES
 */

export const SENDING_DB = {
    NOTIFICATIONS_ALL: {
        REF: 'log_Notifications/',
        _NODE: 'log_Notifications',
        _CHILD: {
            SENDINGID: '/sendingId/',
            PUBLICID: '/publicId/',
            TIMESTAMP: '/timestamp/',
            CURRENT_STAGE: '/currentStage/',
            CURRENT_STATUS: '/currentStatus/',
            CURRENT_STAGE_STATUS: '/currentStage_Status/',
            TITLE: '/title/',
            MSG: '/msg/',
            ICON: '/icon/',
        }
    },
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
            OPERATOR: '/_operator/',
            NOTIFICATIONS: '/_notifications/',
            PAYMENTS: '/_payments/'
        }
    },
    PUBLICID: {
        REF: 'sendingsByPublicid/',
        _NODE: 'sendingsByPublicid',
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
    timestamp: any;
    userUid: string;
    price: number;   
    priceMinFareApplied: boolean;  
    priceItems: Array<any>;             
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
    _shipmentId?: string;
    _notifications?: Array<SendingNotifications>;
    _payments?: any;
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
    pickupSecurityCode: string;
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
    dropSecurityCode: string;       
}

export class SendingNotifications {
    sendingId:string;
    publicId:string;
    timestamp:number;
    currentStage:string;
    currentStatus:string;
    currentStage_Status:string;
    title:string;
    msg:string;
    icon:string;
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
            timestamp: number,
        },
        paid: {
            set: boolean,
            timestamp: number,
        }, 
        enabled: {
            set: boolean,
            timestamp: number,
        },                
    } 
}

export class StageLiveNode {
    _current: string;
    set: boolean;
    status: {
        waitoperator: {
            set: boolean,
            timestamp: number,
        },
        gotoperator: {
            set: boolean,
            timestamp: number,
        },        
        waitpickup: {
            set: boolean,
            timestamp: number,
        }, 
        pickedup: {
            set: boolean,
            timestamp: number,
        },               
        inroute: {
            set: boolean,
            timestamp: number,
        },     
        dropped: {
            set: boolean,
            timestamp: number,
        },        
        notificationsexpired: {
            set: boolean,
            timestamp: number,
        },                  
    } 
}

export class StageClosedNode {
    _current: string;
    set: boolean;
    status: {
        completed: {
            set: boolean,
            timestamp: number,
        },
        canceledbysender: {
            set: boolean,
            timestamp: number,
        },        
        canceledbyoperator: {
            set: boolean,
            timestamp: number,
        },     
        gotoperatorexpired: {
            set: boolean,
            timestamp: number,
        },      
        payexpired: {
            set: boolean,
            timestamp: number,
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

