
/**
 * MODEL CONFIGURATIONS
 */

export const SHIPMENT_CFG = {
    CONFIRM_TIMEOUT: 20,
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
    ]
}

/**
 * SHIPMENT DATA 
 * FIREBASE REFERENCES
 */

export const SHIPMENT_DB = {
    ALL: {
        REF: 'shipments/',
        _NODE: 'shipments',
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