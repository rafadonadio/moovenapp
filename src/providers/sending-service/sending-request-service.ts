import { Injectable } from '@angular/core';
import { SENDING_CFG, SendingRequest } from '../../models/sending-model';

const CFG = SENDING_CFG;

@Injectable()
export class SendingRequestService {

    constructor() {
    }

    getSummary(sending:SendingRequest, stage: string) {
        console.info('getSummary > start');
        let fieldsList = [];
        let summary:any = {};
        switch(stage){
            case CFG.STAGE.CREATED.ID:
                fieldsList = CFG.STAGE.CREATED.SUMMARY_FIELDS;
                break;
            case CFG.STAGE.LIVE.ID:
                fieldsList = CFG.STAGE.LIVE.SUMMARY_FIELDS;
                break;
        }   
        // iterate fields
        for(let index in fieldsList) {
            let field = fieldsList[index];
            summary[field] = sending[field];
        }
        console.log('getSummary for stage '+stage+'> done > ', summary);
        return summary;
    }


    /**
     *  INIT
     */

    getInitialized():SendingRequest {
        let data:SendingRequest = {
            sendingId: '',
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
