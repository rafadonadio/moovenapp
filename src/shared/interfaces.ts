export interface UserCredentials {
    email: string;
    password: string;
}

export interface UserAccount {
    providerId: string,
    email: string,
    profileComplete: {

    },
    emailVerified: boolean,
    emailVerificationAttempts: {

    },
    phoneVerified: boolean,
    phoneVerificationAttempts: {

    },
    lastTosVersionAccepted: string,
    active: number,
    createdAt: string
}

export interface UserProfile {
    firstName: string,
    lastName: string,
    phonePrefix: string,
    phoneMobile: string,
    photoURL: string
}
