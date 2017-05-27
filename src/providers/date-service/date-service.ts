import { Injectable } from '@angular/core';
import * as moment from 'moment';

const defaultUTCzone = '-0300';  // Argentina

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



    getTimestamp():any {
        return moment();
    }

    getUnixTimestamp():any {
        return moment().valueOf();
    }    

    /**
     *  HELPERS
     */

    // transform a timestamp to date
    transformTimestampToHuman(timestamp:string, utcOffset:string = defaultUTCzone):string {
        //console.info('transformTimestampToHuman');
        moment(timestamp);
        let human = moment().utcOffset(utcOffset).format('DD/MM/YYYY HH:mm');
        return human;
    }

    // momentInput: timestamp, ISO8601 string date
    getMonthStr(momentInput:any):string{
        let day = moment(momentInput);
        return day.format('MM').toString();
    }
    getMonthNum(momentInput:any):number{
        let day = moment(momentInput);
        return day.month();
    }    
    getYearStr(momentInput:any):string{
        let day = moment(momentInput);
        return day.format('YYYY').toString();
    }
    getYearNum(momentInput:any):number{
        let day = moment(momentInput);
        return day.year();
    }        

    addTsYears(timestamp:number, years:number):number {
        let date = moment(timestamp);
        return date.add(years, 'y').valueOf();
    }

    //  ISO 8601 datetime format standard
    readISO8601FromTimestamp(timestamp:number):string {
        let day = moment(timestamp);
        return day.format('YYYY-MM-DD')
    }        

}
