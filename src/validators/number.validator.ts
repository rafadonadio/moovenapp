import { FormControl } from '@angular/forms';

interface ValidationResult {
    [key: string]: boolean;
}

export class NumberValidator {

    public static nonZero(control: FormControl): ValidationResult {
        var valid = control.value <= 0;
        if (valid) {
            return { nonZero: true };
        }
        return null;
    }
}
