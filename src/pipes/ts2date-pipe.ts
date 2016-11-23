import { Injectable, Pipe } from '@angular/core';
import { DateService } from '../providers/date-service/date-service';

@Pipe({
    name: 'ts2datePipe'
})
@Injectable()
export class Ts2DatePipe {

    constructor(public dateSrv: DateService) {
    }

    /*
      Takes a timestamp and transform to human date
     */
    transform(value: string) {
        if (value) {
            return this.dateSrv.transformTimestampToHuman(value);
        }
        return value;
    }
}
