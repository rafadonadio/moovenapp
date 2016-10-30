import { Injectable } from '@angular/core';

declare  var  google: any;

@Injectable()
export class GoogleMapsDirectionsService {

    constructor() {}

    getRoute(start:any, end:any): Promise<any> {
        let directionsSrv = new google.maps.DirectionsService;
        return new Promise((resolve, reject) => {
            directionsSrv.route({
                origin: start,
                destination: end,
                travelMode: 'DRIVING'
            }, function (response, status) {
                console.log('getRoute response > ', response);
                console.log('getRoute status > ', status);                   
                if (status === 'OK') {            
                    resolve(response);
                }else{
                    console.log('getRoute > error > ', status);
                    reject(response);                    
                }
            }); 
        });
    }

}
