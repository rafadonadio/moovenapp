import { Injectable, Pipe } from '@angular/core';
import { DateService } from '../providers/date-service/date-service';

@Pipe({
    name: 'formatdatePipe'
})
@Injectable()
export class FormatDatePipe {

    constructor(public dateSrv: DateService) {
    }

    /*
      Takes a timestamp and transform to human date
     */
    transform(value: string, format:string) {
        if (value) {
            return this.dateSrv.displayFormat(value, format);
        }
        return value;
    }
}
