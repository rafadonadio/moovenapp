import { Injectable } from '@angular/core';

declare var google:any;

@Injectable()
export class GoogleMapsService {

    constructor() {}

    ///////////////////// 
    // google.maps.MAP //
    /////////////////////

    initMap(latlng, htmlInputElement) {
        console.info('gmapService > initMap');
        return new google.maps.Map(htmlInputElement, {
            center: latlng,
            zoom: 10,
            disableDefaultUI: true,
            draggable: false,
            clickableIcons: false,
            zoomControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP            
        });
    }

    addMapMarker(latlng:any, map:any):any {
       return new google.maps.Marker({
           map: map,
           position: latlng
       }) 
    }

    ////////////////////////
    // google.maps.PLACES //
    ////////////////////////

    getPlacePredictions(query:string):Promise<any> {
        let autocompleteSrv = new google.maps.places.AutocompleteService();
        return new Promise((resolve, reject) => {
            autocompleteSrv.getPlacePredictions({
                types: ['geocode'],
                input: query,
                componentRestrictions: { country: 'AR' }
            }, function (predictions, status) {
                if(status === 'OK') {
                    resolve(predictions);
                }else{
                    reject(status);
                }
            });
        });    
    }    

    getPlaceDetails(place_id:string, map:any) {
        let placesSrv = new google.maps.places.PlacesService(map);
        return new Promise((resolve, reject) => {
            placesSrv.getDetails({
                placeId: place_id
            }, function(place, status) {
                if(status === 'OK') {
                    resolve(place);
                }else{
                    reject(status);
                }                
            });
        });
    }

    // get all address components
    extractPlaceDetails(place:any):any {
        console.info('gmapService > extractPlaceDetails > init');
        // init
        var details = this.initPlaceDetails();
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
        console.info('gmapService > extractPlaceDetails > done');
        return details;
    }

    // Verify minimum data is present in place detail
    isPlaceAddressComplete(details: any) {
        console.info('gmapService > isPlaceAddressComplete > init');
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
        console.info('gmapService > isPlaceAddressComplete > result > ', passed);        
        return passed;
    }

    setlatLng(lat:any, lng:any):any {
        return {
            lat: lat,
            lng: lng
        }
    }

    initPlaceDetails() {
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