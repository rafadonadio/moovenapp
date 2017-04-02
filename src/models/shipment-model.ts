
/**
 * MODEL CONFIGURATIONS
 */

export const SHIPMENT_CFG = {
    CONFIRM_TIMEOUT: 40,
    WAIT_AFTER_UNLOCK: 10,
    SUMMARY_FIELDS: [
        'objectShortName',
        'pickupAddressLat',
        'pickupAddressLng',  
        'pickupAddressStreetShort',
        'pickupAddressNumber',
        'pickupAddressPostalCode',            
        'pickupAddressCityShort',
        'pickupTimeFrom',
        'pickupTimeTo',
        'dropAddressLat',
        'dropAddressLng',  
        'dropAddressStreetShort',
        'dropAddressNumber',            
        'dropAddressCityShort',
        'dropTimeFrom',
        'dropTimeTo', 
    ],
    NOTIFICATIONS_TO_SHOW: {
        'created_registered': false,
        'created_paid': false,
        'created_enabled': false,
        'live_waitoperator': false,
        'live_gotoperator':true,
        'live_waitpickup': false,
        'live_pickedup':true,
        'live_inroute':true,
        'live_dropped':true,
        'closed_complete':true,
        'closed_canceledbysender':true,
        'closed_canceledbyoperator':true,
        'closed_gotoperatorexpired':true
    }
}

/**
 * SHIPMENT DATA 
 * FIREBASE REFERENCES
 */

export const SHIPMENT_DB = {
    ALL: {
        REF: 'shipments/',
        _NODE: 'shipments',
        _CHILD: {
            CURRENT_STAGE_STATUS: {
                REF: '/_currentStage_Status/',
                _NODE: '_currentStage_Status'
            }
        }
    },
    HASHID: {
        REF: 'shipmentsHashid/',
        _NODE: 'shipmentsHashid',
    },
    BYUSER: {
        REF: 'operatorShipments/',
        _NODE: 'operatorShipments',
        _CHILD: {
            ACTIVE: {
                REF: '/active/',
                _NODE: 'active'
            },
            CLOSED: {
                REF: '/closed/',
                _NODE: 'closed'
            },
            CURRENT_STAGE_STATUS: {
                REF: '/_currentStage_Status/',
                _NODE: '_currentStage_Status'
            }
        }
    },
}

/**
 *  SHIPMENT MODELS
 */

export class ShipmentRequest {
    shipmentId: string;
    publicId: string;
    timestamp: number;
    userUid: string;
    sendingId: string;
    sendingPublicId: string;
    summary: ShipmentRequestSummary;
    _active: string;
    _currentStage_Status: string;
}

export class ShipmentRequestSummary {
    objectShortName: string;
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