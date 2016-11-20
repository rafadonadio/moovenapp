import { Injectable } from '@angular/core';
import { SendingRequest, SendingStages } from '../../models/sending-model';

@Injectable()
export class SendingRequestService {

    constructor() {
    }


    /**
     *  INIT
     */

    getInitialized():SendingRequest {
        let data:SendingRequest = {
            publicId: '',
            timestamp: 0,
            userUid: '',         
            price: 0,   
            priceMinFareApplied: false,               
            routeDistanceMt: 0,
            routeDistanceKm: 0,
            routeDistanceTxt: '',
            routeDurationMin: 0,
            routeDurationTxt: '',
            objectShortName: '',
            objectImageSet: false,
            objectImageUrlTemp: '',
            objectImageDownloadUrl: '',
            objectImageName: '',
            objectImageFullPathRef: '',
            objectType: '',
            objectNoValueDeclared: false,
            objectDeclaredValue: 0,
            pickupAddressSet: false,
            pickupAddressIsComplete: false,
            pickupAddressUserForcedValidation: false,
            pickupAddressPlaceId: '',
            pickupAddressLat: 0,
            pickupAddressLng: 0,            
            pickupAddressFullText: '',
            pickupAddressLine2: '',
            pickupAddressStreetShort: '',
            pickupAddressStreetLong: '',
            pickupAddressNumber: '',
            pickupAddressPostalCode: '',
            pickupAddressCityAreaShort: '',
            pickupAddressCityAreaLong: '',            
            pickupAddressCityShort: '',
            pickupAddressCityLong: '',
            pickupAddressStateAreaShort: '',
            pickupAddressStateAreaLong: '',            
            pickupAddressStateShort: '',
            pickupAddressStateLong: '',
            pickupAddressCountry: '',
            pickupDate: '',
            pickupTimeFrom: '09:00',
            pickupTimeTo: '11:00',
            pickupPersonName: '',
            pickupPersonPhone: '',
            pickupPersonEmail: '',
            dropAddressSet: false,
            dropAddressIsComplete: false,
            dropAddressUserForcedValidation: false,
            dropAddressPlaceId: '',
            dropAddressLat: 0,
            dropAddressLng: 0,            
            dropAddressFullText: '',
            dropAddressLine2: '',
            dropAddressStreetShort: '',
            dropAddressStreetLong: '',
            dropAddressNumber: '',
            dropAddressPostalCode: '',
            dropAddressCityAreaShort: '',
            dropAddressCityAreaLong: '',            
            dropAddressCityShort: '',
            dropAddressCityLong: '',
            dropAddressStateAreaShort: '',
            dropAddressStateAreaLong: '',            
            dropAddressStateShort: '',
            dropAddressStateLong: '',
            dropAddressCountry: '',
            dropDate: '',
            dropTimeFrom: '14:00',
            dropTimeTo: '16:00',
            dropPersonName: '',
            dropPersonPhone: '',
            dropPersonEmail: '',
        }
        return data;
    }

}
