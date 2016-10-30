import { Injectable } from '@angular/core';

declare var google:any;

@Injectable()
export class GoogleMapsPlacesService {

    constructor() {
    }







    // ----------------

    /**
     *  Extract all possible address components from Place result
     */
    extractAddressComponents(place:any):any {
        console.log('gmapService > extractPlaceAddressComponents > init');
        // init
        var details = this.initDetails();
        // run
        details.place_id = place.place_id,
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
        console.log('gmapService > extractPlaceAddressComponents > done');
        return details;
    }

    /**
     *  Verify minimum data is present in place detail
     */
    verifyDetailsMinRequirements(details: any) {
        console.log('gmapService > verifyDetailsMinRequirements > init');
        var passed = true;
        // lat, lng
        passed = details.lat == '' ? false : passed;
        passed = details.lng == '' ? false : passed;
        // street name
        passed = details.components.route.long == '' ? false : passed;
        // street number
        passed = details.components.street_number.long == '' ? false : passed;
        // locality 
        passed = details.components.locality.long == '' ? false : passed;
        console.log('gmapService > verifyDetailsMinRequirements > result > ', passed);        
        return passed;
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
            set: false,       // is set, but may or not be complete
            complete: false,  // min values are complete
            forced: false,    // is not complete, but forced to set by user
            place_id: '',
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
