import { Injectable } from '@angular/core';

declare var google:any;

@Injectable()
export class GoogleMapsService {

    constructor() {}

    /////////////////
    // google.maps //
    /////////////////

    setlatLng(lat:any, lng:any):any {
       let latlng = new google.maps.LatLng(lat, lng);
        return latlng;
    }   

    initInfoWindow() {
        return new google.maps.InfoWindow();
    }

    initPolyline(config:MapsMapPolylineOptions) {
        return new google.maps.Polyline({
            path: config.path,
            geodesic: config.geodesic,
            strokeColor: config.strokeColor,
            strokeOpacity: config.strokeOpacity,
            strokeWeight: config.strokeWeight
        });
    }

    initLatLngBounds() {
        return new google.maps.LatLngBounds();
    }

    ///////////////////// 
    // google.maps.MAP //
    /////////////////////

    initMap(latlng, htmlInputElement, options:MapsMapOptions = {}) {
        console.info('gmapService > initMap');
        let mapOptions = {
            center: latlng,
            zoom: 10,
            maxZoom: 16,
            minZoom:4,
            draggable: false,
            zoomControl: true,
            streetViewControl: false,
            scrollwheel: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
        };
        for(let key in mapOptions) {
            if(key in options) {
                mapOptions[key] = options[key];
            }
        }
        console.log(mapOptions);
        return new google.maps.Map(htmlInputElement, mapOptions);
    }

    addMapMarker(latlng:any, map:any, icon:any = GMAP_CFG.ICONS.DEFAULT):any {
       return new google.maps.Marker({
           map: map,
           position: latlng,
           animation: google.maps.Animation.DROP,
           icon: icon
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
                console.log('getDetails api', place);
                if(status === 'OK') {
                    resolve(place);
                }else{
                    reject(status);
                }                
            });
        });
    }

    // get all address components
    inspectPlaceDetails(place:any):any {
        console.info('gmapService > inspectPlaceDetails > init');
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
        console.info('gmapService > inspectPlaceDetails > done');
        return details;
    }

    // Verify minimum data is present in place detail
    isPlaceAddressComplete(details: any) {
        console.group('isPlaceAddressComplete');
        let isComplete = { passed: true, failed: []};
        let propToCheck = {
            root: ['full_address','lat','lng','place_id'],
            components: ['route','street_number'],
        };
        let labels = {
            'full_address':'Descripción',
            'lat':'Latitud',
            'lng':'Longitud',
            'place_id':'ID',
            'route':'Nombre de Calle',
            'street_number':'Número de Calle'
        };
        // iterate root prop
        for(let index in propToCheck['root']) {
            let prop = propToCheck['root'][index];
            if(!details[prop] || details[prop]=='') {
                isComplete.failed.push(labels[prop]);
                isComplete.passed = false;
            }
            console.log('root prop, value', prop, `'${details[prop]}'`);
        }
        // iterate components prop
        for(let index in propToCheck['components']) {
            let prop = propToCheck['components'][index];
            if(!details.components[prop].long || details.components[prop].long=='') {
                isComplete.failed.push(labels[prop]);
                isComplete.passed = false;
            }
            console.log('root components, value', prop, `'${details.components[prop].long}'`);
        }
        console.log('passed, failed', isComplete);
        console.groupEnd();        
        return isComplete;
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

    /////////////////////////////
    //  google.maps.DIRECTIONS //
    /////////////////////////////

    getRouteDirections(start:any, end:any): Promise<any> {
        let directionsSrv = new google.maps.DirectionsService;
        return new Promise((resolve, reject) => {
            directionsSrv.route({
                origin: start,
                destination: end,
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.METRIC,
                region: 'AR',
                avoidHighways: true,
                avoidTolls: false
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

    inspectRouteDetails(routeResponse:any):any {
        // detail
        let details = this.initRouteDetails();
        // we are using 1 waypoint (A to B), so there is only one "leg" to read
        let leg = routeResponse.routes[0].legs[0];
        // distance
        details.totalDistance.meters = leg.distance.value;
        details.totalDistance.kms = leg.distance.value/1000;
        details.totalDistance.text = leg.distance.text;
        // duration
        details.totalDuration.min = leg.duration.value;
        details.totalDuration.text = leg.duration.text;
        return details;
    }

    getDirectionsRenderer() {
        return new google.maps.DirectionsRenderer();
    }

    initRouteDetails() {
        var details = {
            totalDistance: {
                meters: 0,  // in meters
                kms: 0,     // in km
                text: ''    // textual
            },
            totalDuration: {
                min: 0,     // minutes
                text: ''    // textual
            }
        }
        return details;
    }
    

    //////////////////////////
    // google.maps.DISTANCE //
    //////////////////////////

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

/**
 *  CLASSES
 */

export class MapsMapOptions {
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    draggable?: boolean;
    clickableIcons?: boolean;
    zoomControl?: boolean;
    mapTypeId?: string;
    mapTypeControl?: boolean;
    scrollwheel?: boolean;
    streetViewControl?: boolean;
}

export class MapsMapPolylineOptions {
    path: Array<{lat: number, lng: number}>;
    geodesic: boolean;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
}

export const GMAP_CFG = {
    ICONS: {
        DEFAULT: 'assets/img/map_icon_green_3.png',
        SELECTED: 'assets/img/map_icon_green_3_selected.png',
        CHECKERED: 'assets/img/map_icon_checkered.png',
    },
    POINTS: {
        CABA: {
            LAT: -34.603684, 
            LNG: -58.449240
        }
    }
}