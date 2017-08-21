import { SendingsNotificationsPage } from '../sendings-notifications/sendings-notifications';
import { SendingsClosedPage } from '../sendings-closed/sendings-closed';
import { SendingsActivePage } from '../sendings-active/sendings-active';
import { Component } from '@angular/core';


@Component({
    selector: 'page-sendings-tabs',
    templateUrl: 'sendings-tabs.html',
})
export class SendingsTabsPage {

    tab1Root = SendingsActivePage;
    tab2Root = SendingsClosedPage;
    tab3Root = SendingsNotificationsPage;    

    constructor() {}

}
