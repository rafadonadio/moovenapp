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
                SENDER: ['email'],
                OPERATOR: ['email', 'phone', 'residenceAddress', 'legalIdentityNumber'],      
            }
        },
        SETTINGS: {
            DEFAULT_VALUES: {
                NOTIFICATIONS: {
                    LOCAL_PUSH: true,
                    EMAIL: false,
                }
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
    createdAt: any;
    deletedAt: any;
    terminatedAt:any;
    providerId: string;
    profile: UserAccountProfile;
    ToS: {
        accepted: boolean,
        acceptedTimestamp: any,
        acceptedVersionId: number,
        acceptedVersionTag: string,
        history: Array<{ versionId:string, timestamp:any}>
    };
    settings: UserAccountSettings;
    operator: UserAccountOperator;
}

export class UserAccountOperator {
    enabled: boolean;
    active: boolean;       
}

export class UserAccountSettings {
    notifications: {
        localPush: boolean;
        email: boolean;
    }   
}

export class UserAccountProfile {
    data: UserProfileData;
    status: UserProfileStatus;   
    verifications: UserProfileVerifications 
}

export class UserProfileData {
    email: string;
    emailOnChange: boolean;
    firstName: string;
    lastName: string;
    phonePrefix: string;
    phoneMobile: string;
    photoURL: string;
    photoPath: string;
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
        fieldsComplete: boolean,
        verificationsComplete: boolean
    };
    sender: {
        fieldsComplete: boolean,
        verificationsComplete: boolean
    };            
    operator: {
        fieldsComplete: boolean,
        verificationsComplete: boolean
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
    verifiedTimestamp: any;
    attemptsIds: Array<VerificationAttempts>;
}

export class UserProfilePhoneVerification {
    verified: boolean;
    verifiedNumber: string;
    verifiedTimestamp: any;
    attemptsIds: Array<VerificationAttempts>;
}

export class UserProfileResidenceVerification {
    verified: boolean;
    verifiedAddress: string;
    verifiedTimestamp: any;
    imageUrl: string;
    verifiedBy: string;
}

export class UserProfileLegalidVerification {
    verified: boolean;
    verifiedNumber: string;
    verifiedTimestamp: any;
    imageUrl: string;
    verifiedBy: string;
}

export class VerificationAttempts {
    timestamp: any;
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
            VERIFICATIONS: {
                _NODE: '/profile/verifications',
                EMAIL: {
                    _NODE: '/profile/verifications/email',
                    VERIFIED: '/profile/verifications/email/verified',
                    VERIFIED_ADDRESS: '/profile/verifications/email/verifiedAddress',
                    VERIFIED_TIMESTAMP: '/profile/verifications/email/verifiedTimestamp',
                    ATTEMPTS_IDS: '/profile/verifications/email/attemptsIds/'
                },
                PHONE: {
                    _NODE: '/profile/verifications/phone',
                    VERIFIED: '/profile/verifications/phone/verified',
                    VERIFIED_NUMBER: '/profile/verifications/phone/verifiedNumber',
                    VERIFIED_TIMESTAMP: '/profile/verifications/phone/verifiedTimestamp',
                    ATTEMPTS_IDS: '/profile/verifications/phone/attemptsIds/'
                },     
                LEGAL_IDENTITY_NUMBER: {
                    _NODE: '/profile/verifications/legalIdentityNumber',
                    VERIFIED: '/profile/verifications/legalIdentityNumber/verified',
                    VERIFIED_NUMBER: '/profile/verifications/legalIdentityNumber/verifiedNumber',
                    VERIFIED_TIMESTAMP: '/profile/verifications/legalIdentityNumber/verifiedTimestamp', 
                    VERIFIED_BY: '/profile/verifications/legalIdentityNumber/verifiedBy',
                    IMAGE_URL: '/profile/verifications/legalIdentityNumber/imageUrl',                 
                },
                RESIDENCE_ADDRESS: {
                    _NODE: '/profile/verifications/residenceAddress',
                    VERIFIED: '/profile/verifications/residenceAddress/verified',
                    VERIFIED_ADDRESS: '/profile/verifications/residenceAddress/verifiedAddress',
                    VERIFIED_TIMESTAMP: '/profile/verifications/residenceAddress/verifiedTimestamp', 
                    VERIFIED_BY: '/profile/verifications/residenceAddress/verifiedBy',
                    IMAGE_URL: '/profile/verifications/residenceAddress/imageUrl',     
                }
            }            
        },
        TOS: {
            _NODE: '/ToS',
            ACCEPTED: '/ToS/accepted',
            ACCEPTED_TIMESTAMP: '/ToS/acceptedTimestamp',
            ACCEPTED_VERSION_ID: '/ToS/acceptedVersionId',
            ACCEPTED_VERSION_TAG: '/ToS/acceptedVersionTag',
            HISTORY: '/ToS/history/',
        },
        SETTINGS: {
            _NODE: '/settings',
            NOTIFICATIONS: {
                _NODE: '/settings/notifications',
                LOCALPUSH: '/settings/notifications/localPush',
                EMAIL: '/settings/notifications/email',
            }
        }
    }
}



