import { Injectable, Pipe } from '@angular/core';
import { DateService } from '../providers/date-service/date-service';

@Pipe({
    name: 'calendardatePipe'
})
@Injectable()
export class CalendarDatePipe {

    constructor(public dateSrv: DateService) {
    }

    /*
      Takes a timestamp and transform to human date
     */
    transform(value: string, format:string) {
        if (value) {
            const day = this.dateSrv.displayFormat(value, 'DD');
            const month = this.dateSrv.displayFormat(value, 'MM');
            const cal = this.dateSrv.displayCalendarTime(day, month);
            console.log('calendarPipe', value, cal);
            return cal;
        }
        return value;
    }
}
