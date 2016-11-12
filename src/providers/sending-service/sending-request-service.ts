import { Injectable } from '@angular/core';

import { SendingRequest } from '../../models/sending-model';

@Injectable()
export class SendingRequestService {

    public request:SendingRequest;

    constructor() {
        this.init();
    }

    getSummaryForDbList(sending: SendingRequest, dbList:string) {
        let summary:any = {}
        // base
        summary = {
            publicId: sending.publicId,
            objectShortName: sending.objectShortName,
            timestamp: sending.timestamp,
            currentStatus: sending.currentStatus              
        };
        switch(dbList) {         
            case 'created':
                summary.pickupAddress = this.getSendingPickupAddressSummary(sending);
                summary.pickupAddressLatLng = this.getSendingPickupLatLng(sending);                          
                summary.dropAddress = this.getSendingDropAddressSummary(sending);
                summary.dropAddressLatLng = this.getSendingDropLatLng(sending);
                break;
            case 'user':

                break;
            case 'live':

                break;
            case 'expired':
                
                break;
            case 'completed':

                break;
            case 'unconcluded': 

                break;
        }
        return summary;
    }

    private getSendingPickupAddressSummary(sending:SendingRequest) {
        return sending.pickupAddressStreetShort 
                + ' ' 
                + sending.pickupAddressNumber + ', ' 
                + sending.pickupAddressCityShort;
    }

    private getSendingDropAddressSummary(sending:SendingRequest) {
        return sending.dropAddressStreetShort 
                + ' ' 
                + sending.dropAddressNumber + ', ' 
                + sending.dropAddressCityShort;
    }    

    private getSendingPickupLatLng(sending:SendingRequest) {
        return { lat: sending.pickupAddressLat, lng: sending.pickupAddressLng };
    }

    private getSendingDropLatLng(sending:SendingRequest) {
        return { lat: sending.dropAddressLat, lng: sending.dropAddressLng };
    } 

    /**
     *  INIT
     */

    init() {
        let data = {
            publicId: '',
            timestamp: 0,
            userUid: '',
            currentStatus: '',         
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
        this.request = data;
    }

}
