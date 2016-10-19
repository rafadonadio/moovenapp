import { Injectable, Pipe } from '@angular/core';

@Pipe({
    name: 'capitalizePipe'
})
@Injectable()
export class CapitalizePipe {
    /*
      Takes a value and capitalize first letter
     */
    transform(value: string) {
        if (value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
    }
}
