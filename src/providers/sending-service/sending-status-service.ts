import { Injectable } from '@angular/core';

import { SendingCurrentStatus, StatusNode } from '../../shared/sending-interface';

@Injectable()
export class SendingStatusService {

    public currentStatus:SendingCurrentStatus;

    constructor() {
        this.init();
    }

    init() {
        let initNode:StatusNode = { 
                set:false, 
                value:false, 
                timestamp:0,
                text:'' 
            };
        let status = {
            _current: '',
            registered: initNode,
            vacant: initNode,
            holdforpickup: initNode,
            transit: initNode,
            success: initNode,
            issue: initNode
        }
    }

    get():SendingCurrentStatus {
        return this.currentStatus;
    }

}
