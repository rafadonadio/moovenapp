import { SENDING_CFG } from '../../models/sending-model';
import { Injectable } from '@angular/core';

const CFG = SENDING_CFG.PRICE_LIST.BASIC;

@Injectable()
export class PriceService {

    constructor() {}

    setSendingPrice(totalKms:number) {
        console.log('setSendingPrice', totalKms);
        let ranges = CFG.PER_DISTANCE;
        let range;
        let priceResult = {
            value: null,
            applyMinFare: false,
            items: [],
            processedKms: 0
        }
        // aux
        let aux = {
            pendingKms: totalKms,
            processedKms: 0,
            subtotal: 0,
            items: [],
        }
        // run
        for(let index in ranges) {
            range = ranges[index];
            // calcKms
            let kmsToProcess = this.calcKmsToProcessForCurrentRange(range, aux.pendingKms);
            // calcSubtotal
            let subtotal = this.calcSubtotalForCurrentRange(range, kmsToProcess);
            aux.subtotal+= subtotal;
            aux.items.push({rangeId: range.ID, pricePerKm: range.VALUE_PER_KM, kms: kmsToProcess, subtotal: subtotal });
            // update Aux values
            aux.pendingKms-= kmsToProcess;
            aux.processedKms+= kmsToProcess;
            console.log('done range:', range.ID, aux);
            if(aux.pendingKms == 0) {
                break;
            }
        }
        // round price
        aux.subtotal = this.roundPrice(aux.subtotal);
        // calc min fare
        priceResult.applyMinFare = this.isMinFareApplicable(aux.subtotal);
        priceResult.value = priceResult.applyMinFare ? CFG.MIN_FARE.VALUE : aux.subtotal;
        priceResult.items = aux.items;
        priceResult.processedKms = aux.processedKms;
        console.log('final price', priceResult);
        return priceResult;
    }    

    private calcKmsToProcessForCurrentRange(range:any, pendingKms:number) {
        let calc = 0;
        let segmentSubtotal = range.SMLR_OR_EQUAL - range.GRTR_THAN;
        if(pendingKms>segmentSubtotal) {
            // pendingKms is greater than range Max
            // calculate max kms of current range minus min range value
            calc = segmentSubtotal;
        }else{
            // pendingKms is smaller than range Max
            // calculate the pendingKms
            calc = pendingKms;
        }
        return calc;
    }

    private calcSubtotalForCurrentRange(range:any, kmsToProcess) {
        return range.VALUE_PER_KM * kmsToProcess;
    }

    private roundPrice(value) {
        return Math.round(value);
    }

    private isMinFareApplicable(finalPrice):boolean {
        let applicable:boolean;
        applicable = CFG.MIN_FARE.VALUE > finalPrice ? true : false;
        return applicable;
    }

}
