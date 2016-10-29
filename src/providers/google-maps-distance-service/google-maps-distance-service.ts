import { Injectable } from '@angular/core';

declare  var  google: any;

@Injectable()
export class GoogleMapsDistanceService {

    constructor() {
        console.log('Hello GoogleMapsDistanceService Provider');
    }

    newService() {
        return new google.maps.DistanceMatrixService;
    }

    

}
