import { Injectable } from '@angular/core';

declare  var  google: any;

@Injectable()
export class GoogleMapsDistanceService {

    constructor() {}

    getDistance(origin:any, destination:any):Promise<any> {
        let service = new google.maps.DistanceMatrixService;
        return new Promise((resolve, reject) =>{
            service.getDistanceMatrix({
                origins: [origin],
                destinations: [destination],
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
                avoidHighways: false,
                avoidTolls: false
            }, function (response, status) {
                console.log('getDistance response > ', response);
                console.log('getDistance status > ', status);                   
                if (status == 'OK') {            
                    resolve(response);
                }else{
                    console.log('f4 > calculateDistance > error > ', status);
                    reject(response);                    
                }
            });          
        });
    }

}
