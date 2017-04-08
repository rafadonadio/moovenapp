import { FormControl } from '@angular/forms';

export interface ValidationResult {
    [key: string]: boolean;
}

export class NumberValidator {

    public static nonZero(control: FormControl): ValidationResult {
        let valid = control.value <= 0;
        if (valid) {
            return { nonZero: true };
        }
        return null;
    }

    public static isNumber(control: FormControl): ValidationResult {
        let input = new Number(control.value);
        let valid = input>0;
        if (!valid) {
            return { isNumber: true };
        }
        return null;
    }    
}
