import { ShipmentsNotificationsPage } from '../shipments-notifications/shipments-notifications';
import { ShipmentsClosedPage } from '../shipments-closed/shipments-closed';
import { ShipmentsActivePage } from '../shipments-active/shipments-active';
import { Component } from '@angular/core';

@Component({
    selector: 'page-shipments-tabs',
    templateUrl: 'shipments-tabs.html',
})
export class ShipmentsTabsPage {

    tab1Root = ShipmentsActivePage;
    tab2Root = ShipmentsClosedPage;
    tab3Root = ShipmentsNotificationsPage;    

    constructor() {}

}
