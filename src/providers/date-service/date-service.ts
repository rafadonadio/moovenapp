import { Injectable } from '@angular/core';

import * as moment from 'moment';

@Injectable()
export class DateService {

    constructor() {
    }

    getTimeDiff(from:any, to:any) {
        console.info('getTimeDiff()');
        let diff:number;
        console.log('t1/t2', from, to);
        diff = to.diff(from, "minutes");      
        console.log('diff: ', diff, ' minutes');        
        return diff;
    }

    // set moment from string format > HH:mm
    setTimeMoment(timeString:string): any{
        console.info('setTimeMoment');
        let timeArray:Array<any> = timeString.split(":");
        console.log('timeArray > ', timeArray);
        let time = moment()
                    .hour(timeArray[0])
                    .minute(timeArray[1])
                    .seconds(0);                                             
        return time;                      
    }

    // transform a timestamp to date
    transformTimestampToHuman(timestamp:string):string {
        console.info('dateService > transformTimestampToHuman > timestamp > ', timestamp);
        let day = moment(timestamp);
        let human = day.format('DD/MM/YYYY HH:mm');
        return human;
    }

    getTimestamp():any {
        return moment();
    }

    getUnixTimestamp():any {
        return moment().valueOf();
    }    

}
