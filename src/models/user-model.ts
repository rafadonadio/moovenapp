
export class UserCredentials {
    email: string;
    password: string;
}

export class UserAccount {
    active: number;
    createdAt: number;
    providerId: string;
    profile: {
        data: UserProfileData,
        status: UserProfileStatus,
    };
    verifications: UserProfileVerifications
    ToS: {
        accepted: boolean;
        acceptedTimestamp: number,
        acceptedVersion: string,
        history: Array<{ version:string, timestamp:number}>
    };
}

export class UserProfileData {
    email: string;
    firstName: string;
    lastName: string;
    phonePrefix: string;
    phoneMobile: string;
    photoURL: string;
    dateBirth: string;
    legalIdentityNumber: string;
    residenceCountry: string;
    residenceCity: string;
    residenceAddress: string;
    residenceAddressL2: string;
    lastTosAccepted: string;
}

export class UserProfileStatus {
    basic: {
        requiredFields: boolean,
        requiredVerifications: boolean,
        complete: boolean
    };
    sender: {
        requiredFields: boolean,
        requiredVerifications: boolean,
        complete: boolean
    };            
    operator: {
        requiredFields: boolean,
        requiredVerifications: boolean,
        complete: boolean
    };            
}

export class UserProfileVerifications {
    email: {
        verified: boolean,
        verifiedAddress: string,
        verifiedTimestamp: number,
        attemptsIds: Array<VerificationAttempts>,
    };
    phone: {
        verified: boolean,
        verifiedNumber: string,
        verifiedTimestamp: number,
        attemptsIds: Array<VerificationAttempts>,            
    };
    residenceAddress: {
        verified: boolean,
        verifiedTimestamp: number,
        imageUrl: string,
        verifiedBy: string,
    };
    legalIdentityNumber: {
        verified: boolean,
        verifiedTimestamp: number,
        imageUrl: string,
        verifiedBy: string,
    }; 
}

export class VerificationAttempts {
    timestamp: number;
    reference: any;
}

/**
 *  FIREBASE REFERENCES
 */

export const DB_REF = {
    USER_ACCOUNT: 'userAccount/'
}

/**
 * MODEL CONFIGURATIONS
 */

export const USER_ACCOUNT_CFG = {
    PROFILE: {
        LIST: {
            BASIC: 'basic',
            SENDER: 'sender',
            OPERATOR: 'operator'
        },
        REQUIRED_FIELDS: {
            BASIC: ['email','firstName','lastName'],
            SENDER: ['email','firstName','lastName', 'phone', 'photoURL'],
            OPERATOR: ['email','firstName','lastName', 'phone', 'photoURL', 'dateBirth', 'legalIdentityNumber', 'residenceAddress', 'residenceCity', 'residenceCountry']
        },
        REQUIRED_VERIFICATIONS: {
            BASIC: ['email'],
            SENDER: ['email', 'phone'],
            OPERATOR: ['email', 'phone', 'residenceAddress', 'legalIdentityNumber'],      
        }
    }
}

