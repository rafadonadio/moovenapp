import { Injectable } from '@angular/core';

declare var google:any;

@Injectable()
export class GoogleMapsPlacesService {

    constructor() {
    }

    /**
     *  Extract all possible address components from Place result
     */
    extractAddressComponents(place:any):any {
        console.log('gmapService > extractPlaceAddressComponents > init');
        // init
        var details = this.initDetails();
        // run
        details.full_address = place.formatted_address ? place.formatted_address : '';
        details.lat = place.geometry.location.lat() ? place.geometry.location.lat() : '';
        details.lng = place.geometry.location.lng() ? place.geometry.location.lng() : '';
        for (var i = 0; i < place.address_components.length; i++) {
            let addressType = place.address_components[i].types[0];
            if(details.components[addressType]) {
                details.components[addressType].set = true;
                details.components[addressType].short = place.address_components[i]['short_name'];
                details.components[addressType].long = place.address_components[i]['long_name'];
            }                                     
        }    
        console.log('google maps service > extractPlaceAddressComponents > done');
        return details;
    }

    /**
     *  Verify minimum data is present in place detail
     */
    verifyDetailsComplete(details: any) {
        // full address
        // lat, lng
        // street name
        // street number
        // city 
        return true;
    }

    /**
     * new google maps Places Service instance
     * map: google.maps.Map(HTMLelement)
     */
    newService(map: any) {
        return new google.maps.places.PlacesService(map);
    }

    /**
     *  Init place detail object
     */
    initDetails() {
        var details = {
            set: false,
            full_address: '',
            lat: '',
            lng: '',
            components: {
                route: { set: false, short:'', long:'' },                           // calle 
                street_number: { set: false, short:'', long:'' },                   // numero
                sublocality_level_1: { set: false, short:'', long:'' },             // barrio
                locality: { set: false, short:'', long:'' },                        // localidad, ciudad
                administrative_area_level_2: { set: false, short:'', long:'' },     // zona/comuna/partido 
                administrative_area_level_1: { set: false, short:'', long:'' },     // estado/provincia 
                country: { set: false, short:'', long:'' },                         // pais
                postal_code: { set: false, short:'', long:'' },                     // codigo postal
                postal_code_suffix: { set: false, short:'', long:'' },              // codigo postal - sufijo
            }            
        };
        return details;
    }

}
