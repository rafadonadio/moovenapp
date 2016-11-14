
/**
 * MODEL CONFIGURATIONS
 */

export const USER_CFG = {
    ACCOUNT: {    
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
}

/**
 *  USERS MODELS
 */

export class UserCredentials {
    email: string;
    password: string;
}

export class UserAccount {
    active: boolean;
    createdAt: number;
    providerId: string;
    profile: UserAccountProfile;
    verifications: UserProfileVerifications
    ToS: {
        accepted: boolean,
        acceptedTimestamp: number,
        acceptedVersionId: number,
        acceptedVersionTag: string,
        history: Array<{ versionId:string, timestamp:number}>
    };
}

export class UserAccountProfile {
    data: UserProfileData;
    status: UserProfileStatus;    
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
    email: UserProfileEmailVerification;
    phone: UserProfilePhoneVerification;
    residenceAddress: UserProfileResidenceVerification;
    legalIdentityNumber: UserProfileLegalidVerification;
}

export class UserProfileEmailVerification {
    verified: boolean;
    verifiedAddress: string;
    verifiedTimestamp: number;
    attemptsIds: Array<VerificationAttempts>;
}

export class UserProfilePhoneVerification {
    verified: boolean;
    verifiedNumber: string;
    verifiedTimestamp: number;
    attemptsIds: Array<VerificationAttempts>;
}

export class UserProfileResidenceVerification {
    verified: boolean;
    verifiedAddress: string;
    verifiedTimestamp: number;
    imageUrl: string;
    verifiedBy: string;
}

export class UserProfileLegalidVerification {
    verified: boolean;
    verifiedNumber: string;
    verifiedTimestamp: number;
    imageUrl: string;
    verifiedBy: string;
}

export class VerificationAttempts {
    timestamp: number;
    reference: any;
}

/**
 * USER DATA 
 * FIREBASE REFERENCES
 */

export const USER_DB_REF = {
    USER_ACCOUNT: 'userAccount/',
    USER_ACCOUNT_NODE: 'userAccount',
    _CHILDS: {
        ACTIVE: 'active',
        CREATED_AT: 'createdAt',
        PROVIDER_ID: 'providerId',
        PROFILE: {
            _NODE: 'profile',
            DATA: {
                _NODE: '/profile/data',
                _FIELD: '/profile/data/'                 
            },
            STATUS: {
                _NODE: '/profile/status',
                BASIC: {
                    _NODE: '/profile/status/basic',
                    COMPLETE: '/profile/status/basic/complete',
                    REQUIRED_FIELDS: '/profile/status/basic/requiredFields',
                    REQUIRED_VERIFICATIONS: '/profile/status/basic/requiredVerifications',
                },
                OPERATOR: {
                    _NODE: '/profile/status/operator',
                    COMPLETE: '/profile/status/operator/complete',
                    REQUIRED_FIELDS: '/profile/status/operator/requiredFields',
                    REQUIRED_VERIFICATIONS: '/profile/status/operator/requiredVerifications',
                },
                SENDER: {
                    _NODE: '/profile/status/sender',
                    COMPLETE: '/profile/status/sender/complete',
                    REQUIRED_FIELDS: '/profile/status/sender/requiredFields',
                    REQUIRED_VERIFICATIONS: '/profile/status/sender/requiredVerifications',
                }
            },
        },
        TOS: {
            _NODE: '/ToS',
            ACCEPTED: '/ToS/accepted',
            ACCEPTED_TIMESTAMP: '/ToS/acceptedTimestamp',
            ACCEPTED_VERSION_ID: '/ToS/acceptedVersionId',
            ACCEPTED_VERSION_TAG: '/ToS/acceptedVersionTag',
            HISTORY: '/ToS/history/',
        },
        VERIFICATIONS: {
            _NODE: '/verifications',
            EMAIL: {
                _NODE: '/verifications/email',
                VERIFIED: '/verifications/email/verified',
                VERIFIED_ADDRESS: '/verifications/email/verifiedAddress',
                VERIFIED_TIMESTAMP: '/verifications/email/verifiedTimestamp',
                ATTEMPTS_IDS: '/verifications/email/attemptsIds/'
            },
            PHONE: {
                _NODE: '/verifications/phone',
                VERIFIED: '/verifications/phone/verified',
                VERIFIED_NUMBER: '/verifications/phone/verifiedNumber',
                VERIFIED_TIMESTAMP: '/verifications/phone/verifiedTimestamp',
                ATTEMPTS_IDS: '/verifications/phone/attemptsIds/'
            },     
            LEGAL_IDENTITY_NUMBER: {
                _NODE: '/verifications/legalIdentityNumber',
                VERIFIED: '/verifications/legalIdentityNumber/verified',
                VERIFIED_NUMBER: '/verifications/legalIdentityNumber/verifiedNumber',
                VERIFIED_TIMESTAMP: '/verifications/legalIdentityNumber/verifiedTimestamp', 
                VERIFIED_BY: '/verifications/legalIdentityNumber/verifiedBy',
                IMAGE_URL: '/verifications/legalIdentityNumber/imageUrl',                 
            },
            RESIDENCE_ADDRESS: {
                _NODE: '/verifications/residenceAddress',
                VERIFIED: '/verifications/residenceAddress/verified',
                VERIFIED_ADDRESS: '/verifications/residenceAddress/verifiedAddress',
                VERIFIED_TIMESTAMP: '/verifications/residenceAddress/verifiedTimestamp', 
                VERIFIED_BY: '/verifications/residenceAddress/verifiedBy',
                IMAGE_URL: '/verifications/residenceAddress/imageUrl',     
            }
        }
    }
}



