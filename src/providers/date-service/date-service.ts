import { Injectable } from '@angular/core';
import * as moment from 'moment';

const defaultUTCzone = '-0300';  // Argentina

@Injectable()
export class DateService {

    constructor() {
    }

    getTimeDiff(from:any, to:any) {
        // console.info('getTimeDiff()');
        let diff:number;
        // console.log('t1/t2', from, to);
        diff = to.diff(from, "minutes");      
        // console.log('diff: ', diff, ' minutes');        
        return diff;
    }

    getDiff(from:any, to:any) {
        let a = moment(to);
        let b = moment(from);
        // diff is greater diff smaller
        return a.diff(b, 'minutes');
    }

    // set moment from string format > HH:mm
    setTimeMoment(timeString:string): any{
        // console.info('setTimeMoment');
        let timeArray:Array<any> = timeString.split(":");
        // console.log('timeArray > ', timeArray);
        let time = moment()
                    .hour(timeArray[0])
                    .minute(timeArray[1])
                    .seconds(0);                                             
        return time;                      
    }

    setTimeToDate(date:string, hour:number, minute:number) {
        return moment(date).hour(hour).minute(minute).format();
    }


    getTimestamp():any {
        return moment();
    }

    // outputs the number of milliseconds since the Unix Epoch
    getUnixTimestamp():any {
        return moment().valueOf();
    }    

    getIsoString(utcOffset:string = defaultUTCzone) {
        return moment().utcOffset(utcOffset).format();
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
    getHourNum(date:any): number {
        return moment(date).hour();
    }    
    getMinuteNum(date:any): number {
        return moment(date).minute();
    }        
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

    addDays(date:string, days:number)  {
        return moment(date).add(days, 'days').format();
    }

    addHours(date:string, hours:number)  {
        return moment(date).add(hours, 'hours').format();
    } 

    addMinutes(date:string, minutes:number)  {
        return moment(date).add(minutes, 'minutes').format();
    }    

    subtractMinutes(date:string, minutes:number)  {
        return moment(date).subtract(minutes, 'minutes').format();
    }            

    //  ISO 8601 datetime format standard
    readISO8601FromTimestamp(timestamp:number):string {
        let day = moment(timestamp);
        return day.format('YYYY-MM-DD')
    }        

    isDateToday(date:any): boolean {
        let isToday:boolean;
        let today = moment().date();
        if(moment(date).date()==today) {
            isToday = true;
        }else{
            isToday = false;
        }
        console.log('isDateToday', date, today, isToday);
        return isToday;
    }

}

export const DATE_DEFAULTS = {
    PICKUP_TIME_FROM: {
        txt: '09:00',
        hour: 9,
        minute: 0
    },
    PICKUP_TIME_TO: {
        txt: '11:00',
        hour: 11,
        minute: 0
    },
    DROP_TIME_FROM: {
        txt: '14:00',
        hour: 14,
        minute: 0
    },
    DROP_TIME_TO: {
        txt: '16:00',
        hour: 16,
        minute: 0
    },  
    PICKUP_DIFF_DAYS: 5,
    PICKUP_DROP_MIN_DIFF_IN_MINUTES: 120,  
}

export const DATES_NAMES = {
    monthNames: {
        'es': ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    },
    monthShortNames: { 
        'es': ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    },
    dayNames: {
        'es': ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    },
    dayShortNames: {
        'es': ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
    }
}