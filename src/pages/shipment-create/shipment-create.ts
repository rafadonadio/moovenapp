import { Subscription } from 'rxjs/Rx';
import { SendingRequestLiveSummary } from '../../models/sending-model';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, NavController, ToastController, ViewController } from 'ionic-angular';
import { ShipmentsTabsPage } from '../shipments-tabs/shipments-tabs';
import { ShipmentCreate2Page } from '../shipment-create-2/shipment-create-2';
import { SendingService } from '../../providers/sending-service/sending-service';
import {
    GMAP_CFG,
    GoogleMapsService,
    MapsMapOptions,
    MapsMapPolylineOptions
} from '../../providers/google-maps-service/google-maps-service';
import { DateService } from '../../providers/date-service/date-service';

/**
 * @name Shipment Create
 * @module moovenapp
 * @description
 * Shipment Create Page is where Operators select sendings to ship.
 *      A selected sending and confirmed, converts to a shipment
 * To be listed as vacant a sending must be in status "waitoperator".
 *      Must be paid and enabled.
 * Sendings can be listed by "date" and "map center".
 * View is in realtime mode always, using firebase and geofire suscriptions
 *      UI auto updates upon changes in DB in realtime. 
 * 
 * LOGIC
 * 1. subscribe to "_sendingsLiveGeofireDates" (this.datesListSubs)
 *    each node represents a date (MM_DD) with at least 1 vacant sending
 *    add dates as element of the array
 *    by default:
 *      - element '0' of mapDate is set as dateSlug [MM_DD]
 *      - element '0' of mapCenter is set as map lat/lng
 * 2. Run Geofire
 *    at least one date must be available to start geofire
 *    parameters used to trigger geofire
 *      - dateSlug: used to set the DB reference
 *                  In the DB, each "dateslug" is a separate geofire list  
 *      - mapCenter: lat, lng and radius
 *                   used for query (geoFireQuery), tracks keys matching criteria   
 *    Two GeoCallbackRegistration are set:
 *      - geoFireRegIn: (key_entered) track when key is written to this geofire list
 *                      For each new element, another DB read is made to /sending/ID 
 *                      to get sending Data
 *      - geoFireRegIn: (key_exited) track when key is removed from geofire list
 *                      For each removed element, Map/UI is updated deleting the sending 
 * 3. Switch MapDate / MapCenter
 *    MapDate/MapCenter is changed/selected from UI
 *    Both Geofire GeoCallbackRegistration are closed (canceled)
 *    Gmap is reseted
 *    Geofire is re-started, with new Db Ref and new GeoCallbackRegistration
 */

@Component({
    selector: 'page-shipment-create',
    templateUrl: 'shipment-create.html',
})
export class ShipmentCreatePage implements OnInit {

    // aux
    loader:any;     
    // geofire
    geoFire: any;
    geoFireQuery: any;
    geoFireRegIn: any;
    geoFireRegOut: any;    
    // maps dates
    flagDatesInitiated: boolean;
    flagDatesExist: boolean;
    datesListSubs: Subscription;
    datesList: Array<any>;
    dateIndexSelected: number;
    dateEditing: boolean;
    mapDate: MapDate;  
    // map center
    mapCenterList: Array<MapCenter>;
    mapCenterSelected: number;
    mapCenterEditing: boolean;
    mapCenter: MapCenter;
    // map 
    map: any;
    mapMarkers = {
        list: [],
        selected: ''
    };
    routeLine: any;
    mapMarkerSelected: any;
    // vacant sendings
    vacants: Array<any>;
    vacantsIndexList: Array<string>;

    constructor(public navCtrl: NavController,
        public gmapsService: GoogleMapsService,
        public dateSrv: DateService,
        public sendingSrv:SendingService,
        public alertCtrl: AlertController,
        public loaderCtrl: LoadingController,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController) {

    }

    ngOnInit() {   
        console.groupCollapsed('SHIPMENT_CREATE INIT');
        // set mapCenter
        this.mapCenterListSet();   
        this.mapCenterSet(0);  
        this.gmapReset();
        // set mapDates: geofire
        this.mapDatesReset();
        this.mapDatesSubscribe(); 
        console.groupEnd();
    }

    ionViewWillEnter() {      
        console.groupCollapsed('ION_VIEW_WILL_ENTER');
        this.flagDatesInitiated = false; 
        console.groupEnd();
    }

    ionViewWillLeave() {
        this.unsubscribe();
    }

    // navigation
    goBack() {
        this.navCtrl.setRoot(ShipmentsTabsPage);
    }

    /**
     * MANUAL RESET CONNECTION 
     * reset mapDatesSuscription and Geofire
     */
    manualReset() {
        console.groupCollapsed('MANUAL_RESET');
        this.showToast('REINICIANDO CONEXIÓN... Ten en cuenta que el listado de servicios esta siempre conectado en Tiempo Real y se actualiza automáticamente. Este boton es solamente para forzar un reinicio de la conexión.', 7000, 'top');
        this.geofireCancel();
        this.gmapReset();
        this.geofireRun();        
        console.groupEnd();
    }


    /**
     *  MAP DATES
     */
    mapDateSwitch(index) {
        console.log('mapDateSwitch');
        this.geofireCancel();
        this.mapDateSet(index);
        this.gmapReset();
        this.geofireRun();
    }
    mapDateChangeClose() {
        console.log('mapDateChangeClose');  
        this.dateEditing = false;    
    }    
    mapDateChange() {
        console.log('mapDateChange'); 
        this.mapCenterCloseChange(); 
        this.dateEditing = true;    
    }
    mapDateSet(index = null) {
        console.groupCollapsed('SET_MAP_DATE');
        this.dateIndexSelected = index==null ? this.dateIndexSelected : index;
        this.mapDate = this.datesList[this.dateIndexSelected];        
        this.dateEditing = false;
        console.log('index', index);
        console.log('dateIndexSelected', this.dateIndexSelected);
        console.log('mapDate', this.mapDate);
        console.groupEnd();
    }
    private mapDatesReset() {
        console.groupCollapsed('RESET_MAP_DATE');
        this.mapDate = null;
        this.flagDatesExist = false;
        this.datesList = [];
        this.dateIndexSelected = null;
        this.dateEditing = false; 
        console.log('mapDate, flagDatesExist, datesList, dateIndexSelected, dateChange', 
            this.mapDate, this.flagDatesExist, this.datesList, this.dateIndexSelected, this.dateEditing);
        console.groupEnd();
    } 

    /**
     *  MAP CENTER
     */
    mapCenterSwitch(index) {
        console.log('mapCenterSwitch');
        this.geofireCancel();
        this.mapCenterSet(index);
        this.gmapReset();
        this.geofireRun();       
    }    
    mapCenterCloseChange() {
        console.log('mapCenterCloseChange');  
        this.mapCenterEditing = false;    
    }
    mapCenterChange() {
        console.log('mapCenterChange');  
        this.mapDateChangeClose();
        this.mapCenterEditing = true;    
    }
    mapCenterSet(index) {
        console.groupCollapsed('SET_MAP_CENTER');
        this.mapCenterSelected = index;
        this.mapCenter = this.mapCenterList[this.mapCenterSelected];        
        this.mapCenterEditing = false;
        console.log('mapCenter', index, this.mapCenter);
        console.groupEnd();
    }
    private mapCenterListSet() {
        console.groupCollapsed('INIT_MAP_CENTER');
        this.mapCenterList = GMAP_CFG.POINTS;
        console.log('mapCenterList', this.mapCenterList);
        console.groupEnd();
    }     

    /**
     *  GEOFIRE
     */
    private mapDatesSubscribe() {
        // dates observable, subscribe
        this.showLoading('Cargando fechas ...');
        let obs = this.sendingSrv.getGeofireLiveDatesObs(true);
        this.datesListSubs = obs.subscribe(snaps => {
            console.groupCollapsed('MAP_DATES_SUSCRIPTION ...');
            // initial flags
            this.flagDatesInitiated = true;
            this.closeLoading();
            // aux arrays
            let auxDatesSlugs = [];
            let auxDatesList = [];
            // iterate suscription snapshot
            snaps.forEach(child => {
                // set map date Obj
                let dateSlug:string = child.key;
                let dates = child.val();
                //console.log('child.val:dates', dateSlug, dates);
                let dateMonth = dateSlug.substr(0,2); // extract month from string
                let dateDay = dateSlug.substr(3,2);   // extract day from string
                let date:MapDate = {
                    dateSlug: dateSlug,
                    dateString: `${dateDay}/${dateMonth}`,
                    dateCalendar: this.dateSrv.displayCalendarTime(dateDay, dateMonth),
                    list: dates,
                    keys: Object.keys(dates)
                }
                auxDatesSlugs.push(dateSlug);
                auxDatesList.push(date);
            });
            console.log('aux[]', auxDatesSlugs, auxDatesList);
            
            // set mapDate index
            let mapDateIndex = 0;
            if(this.mapDate) {
                // mapDate is previously set
                const currentMapDateIndexInAux = auxDatesSlugs.findIndex(x => x == this.mapDate.dateSlug);
                if(currentMapDateIndexInAux>-1) {
                    // current mapDate still available
                    mapDateIndex = currentMapDateIndexInAux;
                }else{
                    // current mapDate no longer available
                    if(this.datesList.length>0) {
                        // only show if vacants are displayed
                        // may not been showed because they may have expired
                        this.showToast(`En este momento, para "${this.mapDate.dateCalendar}" no hay Servicios disponibles`, 2000, 'middle');
                    }
                }
            }
            console.log('mapDateIndex', mapDateIndex);            
            // dateslist
            if(auxDatesList.length>0) {
                // dates available, set
                this.datesList = auxDatesList.concat([]); 
                this.mapDateSet(mapDateIndex);
                this.flagDatesExist = true;
                // run geofire
                this.geofireRun();
            }else{
                // no dates available, reset
                if(this.datesList.length>0) {
                    this.showToast(`En este momento no hay Servicios disponibles`, 2000, 'bottom');
                }
                this.mapDatesReset();       
                this.geofireCancel();         
            }
            console.log('datesList', this.datesList);     
            console.groupEnd();  
        }, error =>{
            console.log('datesListSubs error', error);
            console.groupEnd();
        });
    }

    private geofireRun() {
        if(this.geoFire) {
            console.log('Geofire already running ...');
            return;
        }
        // RUN
        console.groupCollapsed('RUN_GEOFIRE');
        // show loading
        this.showLoading('Cargando Servicios ...');
        setTimeout(() => {
            this.closeLoading();
        }, 750);
        // run
        this.vacants = [];
        this.vacantsIndexList = [];
        const dateSlug = this.mapDate.dateSlug;
        const lat = this.mapCenter.lat;
        const lng = this.mapCenter.lng;
        const radius = this.mapCenter.radius;
        console.log('dateSlug, lat, lng, radius', dateSlug, lat, lng, radius);
        const dbRef = this.sendingSrv.getGeofireDbRef(dateSlug);
        this.geoFire = this.sendingSrv.getGeofire(dbRef);
        
        // IN > ADD
        console.log('IN query started', this.mapCenter.label, lat, lng);
        this.geoFireQuery = this.geoFire.query({
            center: [lat, lng],
            radius: radius/1000 // in KM
        });
        this.geoFireRegIn = this.geoFireQuery.on('key_entered', (key, location, distance) => {
            this.sendingSrv.getLiveByIdOnce(key)
                .then(snap => {
                    console.groupCollapsed('IN: ADD_VACANT');
                    const liveVacant = snap.val();
                    const item: Vacant = {
                        key: key,
                        location: location,
                        distance: distance,
                        sending: liveVacant
                    }
                    if(this.hasVacantExpired(liveVacant)) {
                        console.log('vacant has expired, will not be added');
                        console.groupEnd();
                        return;
                    }

                    // all good, add vacant
                    console.log('key', key);                        
                    // push to arrays
                    this.vacantsIndexList.push(key);
                    this.vacants.push(item);
                    // add marker to map
                    let latlng = {
                        lat: location[0],
                        lng: location[1],
                    }
                    this.addMapMarker(latlng, key);
                    console.log('vacantsIndexList', this.vacantsIndexList); 
                    console.log('vacants', this.vacants); 
                    console.groupEnd();
                })
                .catch(err => console.log('error', err));   
        });
        
        // OUT > DELETE
        console.log('OUT query started', this.mapCenter.label, lat, lng);
        this.geoFireRegOut = this.geoFireQuery.on('key_exited', (key, location, distance) => {
            console.groupCollapsed('OUT: REMOVE_VACANT');
            console.log('key', key);
            const index = this.vacantsIndexList.findIndex(x => x == key);
            if(index>-1) {
                console.log('index', index);
                // console.log('before deleting', this.vacantsIndexList, this.vacants);
                if(this.mapMarkers.selected == key) {
                    // vacant is selected, show message, close and remove.
                    this.resetSelected();
                    this.resetMapCenter();           
                    this.showToast('Lo sentimos, este Servicio ya no esta disponible', 2500, 'middle');         
                }
                // remove element from array
                this.vacants.splice(index, 1);
                this.vacantsIndexList.splice(index, 1);
                // remove map marker      
                this.deleteMapMarker(key);             
                // console.log('after deleting', this.vacantsIndexList, this.vacants);
            }else{
                console.warn('index not_found! (it must exist)', key, index);
            }
            console.groupEnd();               
        });     
        console.groupEnd();        
    }

    private geofireCancel() {
        console.groupCollapsed('GEOFIRE_CLOSE');
        if(this.geoFireRegIn) {
            this.geoFireRegIn.cancel();
            console.log('geofireIn closed');            
        }
        if(this.geoFireRegOut) {
            this.geoFireRegOut.cancel();
            console.log('geofireOut closed');            
        }   
        this.geoFire = null;
        this.geoFireRegIn = null;
        this.geoFireRegOut = null;     
        this.vacants = [];
        this.vacantsIndexList = [];  
        console.groupEnd();             
    }

    private hasVacantExpired(liveVacant: SendingRequestLiveSummary):boolean {
        console.groupCollapsed('HAS_VACANT_EXPIRED')
        const hasExpired = this.sendingSrv.hasVacantExpired(liveVacant);
        console.log('hasExpired', hasExpired);      
        console.groupEnd();
        return hasExpired;
    }

    /**
     *  SENDING SELECT
     */

    select(vacantKey:string, vacantSending:SendingRequestLiveSummary) {
        const expired = this.hasVacantExpired(vacantSending);        
        if(expired) {
            let alert = this.alertCtrl.create({
                title: 'El Servicio ha expirado',
                subTitle: 'No es posible tomar el Servicio porque ha expirado, por favor intenta seleccionar otro Servicio disponible.',
                buttons: ['Cerrar']
            });
            alert.present();       
            return;     
        }
        // 
        // All good, continue
        let loader = this.loaderCtrl.create({
            content: 'verificando disponibilidad ...'
        });
        loader.present();
        // process attempt
        this.sendingSrv.attemptToLockVacant(vacantKey)
            .then((result) => {
                console.log('attempt result > ', result);
                if(result.didLock===true) {
                    loader.dismiss()
                        .then(() => {
                            this.goToConfirm(vacantKey, vacantSending);
                        });
                }else if(result.isTaken===true) {
                    let title = 'Servicio tomado';
                    let message = `El servicio ya ha sido tomado y esta siendo procesado. Por favor selecciona otro servicio.`;
                    loader.dismiss()
                        .then(() => {
                            this.showAlertAndCancel(title, message);
                        });                    
                }else if(result.didLock===false) {
                    let timeLeft = Math.round(result.lockTimeLeft);
                    let title = 'No disponible';
                    let message = `El servicio esta siendo visualizado por otro operador en este preciso momento. 
                                    Si el otro operador no lo confirma podras volver a intentarlo en ${timeLeft} segundos`;
                    loader.dismiss()
                        .then(() => {
                            this.showAlertAndCancel(title, message);
                        });                    
                }
            })
            .catch((result)=> {
                console.log('attempt error > ', result);
                let title = 'Error';
                let message = 'Ocurrió un error al intentar seleccionar el servicio, por favor vuelve a intentarlo';
                loader.dismiss()
                    .then(() => {
                        this.showAlertAndCancel(title, message);
                    });
            });      

    }

    selectedToggle(vacant:any) {
        if(this.mapMarkers.selected == vacant.key) {
            // already selected, de-select
            this.resetSelected();
            this.resetMapCenter();
        }else{
            // select
            let sendingId = vacant.key;
            let live:SendingRequestLiveSummary = vacant.sending;
            let pickupLatLng = this.gmapsService.setlatLng(live.pickupAddressLat, live.pickupAddressLng);
            let dropLatLng = this.gmapsService.setlatLng(live.dropAddressLat, live.dropAddressLng);            
            // center map and zoom
            this.map.panTo({
                lat: live.pickupAddressLat,
                lng: live.pickupAddressLng
            })
            // position map to show complete polyline
            let bounds = this.gmapsService.initLatLngBounds();
            bounds.extend(pickupLatLng);
            bounds.extend(dropLatLng);
            this.map.fitBounds(bounds);
            //this.map.setZoom(12);
            // set current marker selected
            this.setMarkerSelected(sendingId);
            this.addMapMarkerSelected(dropLatLng);
            // draw polyline
            let coordinates = [pickupLatLng, dropLatLng];
            let routeLineCfg: MapsMapPolylineOptions = {
                path: coordinates,
                geodesic: true,
                strokeColor: 'red',
                strokeOpacity: 0.8,
                strokeWeight: 3
            };
            this.routeLine = this.gmapsService.initPolyline(routeLineCfg);
            this.routeLine.setMap(this.map); 
        }
    }

    /**
     *  GET
     */

    private goToConfirm(sendingId:string, sendingData:any) {
        this.navCtrl.setRoot(ShipmentCreate2Page, {
            sendingId: sendingId,
            sending: sendingData
        });        
    }

    /**
     *  MAP
     */

    private setMarkerSelected(key) {
        this.resetSelected();
        this.mapMarkers.selected = key;
        this.mapMarkers.list[key].setIcon(GMAP_CFG.ICONS.SELECTED);
    }

    private resetSelected() {
        if(this.mapMarkers.selected!=='') {
            this.mapMarkers.list[this.mapMarkers.selected].setIcon(GMAP_CFG.ICONS.DEFAULT);
            this.mapMarkers.selected = '';
            this.routeLine.setMap(null);
            this.removeMapMarkerSelected();
        }        
    }

    private removeMapMarkerSelected() {
        this.mapMarkerSelected.setMap(null);
    }

    private addMapMarkerSelected(latLng:any):void {
        console.groupCollapsed('ADD_MAP_MARKER_SELECTED');
        this.mapMarkerSelected = this.gmapsService.addMapMarker(latLng, this.map, GMAP_CFG.ICONS.CHECKERED);
        console.log('mapMarkerSelected', this.mapMarkerSelected);
        console.log('mapMarkers.selected', this.mapMarkers.selected);
        console.groupEnd();        
    }

    private deleteMapMarker(key:string) {
        console.groupCollapsed('DELETE_MAP_MARKER')
        this.mapMarkers.list[key].setMap(null);
        const deleted = delete this.mapMarkers.list[key];
        console.log('result:', deleted);        
        console.groupEnd();
    }

    private addMapMarker(latlng:any, key:string):void {
        console.groupCollapsed('ADD_MAP_MARKER');
        let marker = this.gmapsService.addMapMarker(latlng, this.map);
        this.mapMarkers.list[key] = marker;
        console.log('list', this.mapMarkers.list);
        console.groupEnd();
    }  

    private getMapDefaultSettings():MapDefaultSettings{
        let settings:MapDefaultSettings = {
            latlng: this.gmapsService.setlatLng(GMAP_CFG.DEFAULT_CENTER.LAT, GMAP_CFG.DEFAULT_CENTER.LNG),
            zoom: 11                
        }
        return settings;
    }

    private resetMapCenter():void {
        let settings = this.getMapDefaultSettings();
        const latLng = this.gmapsService.setlatLng(this.mapCenter.lat, this.mapCenter.lng);
        this.map.setCenter(latLng);
        this.map.setZoom(this.mapCenter.zoom);
    }

    private gmapReset() {
        console.groupCollapsed('GMAP_RESET');
        let latlng = this.gmapsService.setlatLng(this.mapCenter.lat, this.mapCenter.lng);
        let divMap = (<HTMLInputElement>document.getElementById('maps1'));
        let options:MapsMapOptions = {
            zoom: this.mapCenter.zoom,
            maxZoom: 16, 
            minZoom: 8,
            draggable:true
        }
        // init map
        this.map = this.gmapsService.initMap(latlng, divMap, options);
        console.groupEnd();
    }      

    /**
     *  HELPERS
     */

    private showAlertAndCancel(title:string, message:string):void {
        let alert = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: ['Cerrar']
        });
        alert.present();
    }  

    private unsubscribe() {
        this.geofireCancel();
        if(this.datesListSubs) {
            console.log('datesListSubs Unsubscribed');
            this.datesListSubs.unsubscribe();
        }
        this.datesList = null;
    }

    private showLoading(text:string) {
        this.loader = this.loaderCtrl.create({
            content: text
        });
        this.loader.present();
    }

    private closeLoading() {
        if(this.loader) {
            this.loader.dismiss();
            this.loader.onDidDismiss(() => {
                // console.log('loader dismissed');
            });            
        }
    }

    private showToast(message:string, duration:number = 1500, position:string = 'bottom') {
        let toast = this.toastCtrl.create({
            message: message,
            duration: duration,
            position: position
        });
        toast.present();
    }

}

export class MapDefaultSettings {
    latlng:any;
    zoom: number;
}

export class MapDate {
    dateSlug:string;
    dateString:string;
    dateCalendar:string;
    list: Array<any>;
    keys:Array<any>;    
}

export class MapCenter {
    index:number;
    id:string;
    label:string;
    lat:number;
    lng:number;
    radius:number;
    zoom:number;
}

export class Vacant {
    key:string;
    location:Array<any>;
    distance:number;
    sending:SendingRequestLiveSummary;
}