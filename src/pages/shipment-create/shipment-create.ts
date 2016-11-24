import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ShipmentsPage } from '../shipments/shipments';
import { ShipmentCreate2Page } from '../shipment-create-2/shipment-create-2';
import { ShipmentsService } from '../../providers/shipments-service/shipments-service';
import { SendingService } from '../../providers/sending-service/sending-service';
import { GoogleMapsService, MapsMapOptions } from '../../providers/google-maps-service/google-maps-service';
import { DateService } from '../../providers/date-service/date-service';
import { UsersService } from '../../providers/users-service/users-service';

@Component({
    selector: 'page-shipment-create',
    templateUrl: 'shipment-create.html',
})
export class ShipmentCreatePage implements OnInit {

    vacants = [];
    // map
    map: any;
    mapMarkers = [];

    constructor(public navCtrl: NavController,
        public gmapsService: GoogleMapsService,
        public dateSrv: DateService,
        public users: UsersService,
        public shipSrv:ShipmentsService,
        public sendingSrv:SendingService) {

    }

    ngOnInit() {
        // set map
        this.initMap();
        /// get vacants
        this.getVacants();
    }

    goToCreate2() {
        this.navCtrl.setRoot(ShipmentCreate2Page);
    }

    goBack() {
        this.navCtrl.setRoot(ShipmentsPage);
    }


    /**
     *  GET
     */

    getVacants() {
        let ref = this.sendingSrv.getLiveVacantRef();
        ref.on('child_added', (data) => {
            this.vacants.push({key:data.key, data: data.val()});
            console.log('getVacants > data', this.vacants);
            // add markers to map
            let latlng = {
                lat: data.val().pickupAddressLat,
                lng: data.val().pickupAddressLng,
            }
            this.addMapMarker(latlng);
        })
    }

    /**
     *  MAP
     */

    private addMapMarker(latlng:any):void {
        console.info('addMapMarker');
        let marker = this.gmapsService.addMapMarker(latlng, this.map);
        this.mapMarkers.push(marker);
    }  

    private initMap() {
        console.info('initMap');
        let self = this;
        let latlng = this.gmapsService.setlatLng(-34.603684, -58.449240);
        let divMap = (<HTMLInputElement>document.getElementById('maps1'));
        let options:MapsMapOptions = {
            zoom: 11,
            maxZoom: 16, 
            minZoom: 11,
            draggable:true
        }
        // init map
        this.map = this.gmapsService.initMap(latlng, divMap, options);
        this.map.addListener('zoom_changed', function() {
            console.log(self.map.getZoom());
        });
    }
}
