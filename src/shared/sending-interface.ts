
export interface SendingRequest{
    publicId: string,
    timestamp: number,
    userUid: string,
    price: number,   
    priceMinFareApplied: boolean,               
    routeDistanceMt: number,
    routeDistanceKm: number,
    routeDistanceTxt: string,
    routeDurationMin: number,
    routeDurationTxt: string,
    currentStatus: {},   
    stages: {},  
    objectShortName: string,
    objectImageSet: boolean,
    objectImageUrl: string, 
    objectImageDownloadUrl: string,
    objectImageName: string,
    objectImageFullPathRef: string,
    objectType: string,
    objectNoValueDeclared: boolean,
    objectDeclaredValue: number,
    pickupAddressSet: boolean,
    pickupAddressIsComplete: boolean,
    pickupAddressUserForcedValidation: boolean,
    pickupAddressPlaceId: string,
    pickupAddressLat: number,
    pickupAddressLng: number,            
    pickupAddressFullText: string,
    pickupAddressLine2: string,
    pickupAddressStreetShort: string,
    pickupAddressStreetLong: string,
    pickupAddressNumber: string,
    pickupAddressPostalCode: string,
    pickupAddressCityAreaShort: string,
    pickupAddressCityAreaLong: string,            
    pickupAddressCityShort: string,
    pickupAddressCityLong: string,
    pickupAddressStateAreaShort: string,
    pickupAddressStateAreaLong: string,            
    pickupAddressStateShort: string,
    pickupAddressStateLong: string,
    pickupAddressCountry: string,
    pickupDate: string,
    pickupTimeFrom: string,
    pickupTimeTo: string,
    pickupPersonName: string,
    pickupPersonPhone: string,
    pickupPersonEmail: string,
    dropAddressSet: boolean,
    dropAddressIsComplete: boolean,
    dropAddressUserForcedValidation: boolean,
    dropAddressPlaceId: string,
    dropAddressLat: number,
    dropAddressLng: number,            
    dropAddressFullText: string,
    dropAddressLine2: string,
    dropAddressStreetShort: string,
    dropAddressStreetLong: string
    dropAddressNumber: string,
    dropAddressPostalCode: string,
    dropAddressCityAreaShort: string,
    dropAddressCityAreaLong: string,            
    dropAddressCityShort: string,
    dropAddressCityLong: string
    dropAddressStateAreaShort: string,
    dropAddressStateAreaLong: string,            
    dropAddressStateShort: string,
    dropAddressStateLong: string,
    dropAddressCountry: string,
    dropDate: string,
    dropTimeFrom: string,
    dropTimeTo: string,
    dropPersonName: string,
    dropPersonPhone: string,
    dropPersonEmail: string,          
}

export interface SendingStages {
    created: StageNode,
    payment: StageNode,
    bonus: StageNode,
    enabled: StageNode,
    operator: StageNode,
    pickup: StageNode,
    drop: StageNode,
    canceled: StageNode,
    unconcluded: StageNode
}

export interface StageNode {
    value:boolean, 
    timestamp:number, 
    text:string 
}

export interface SendingCurrentStatus {
    _current: string,
    registered: StatusNode,
    vacant: StatusNode,
    holdforpickup: StatusNode,
    transit: StatusNode,
    success: StatusNode,
    issue: StatusNode
}

export interface StatusNode {
    set: boolean,
    value:boolean, 
    timestamp:number, 
    text:string 
}

