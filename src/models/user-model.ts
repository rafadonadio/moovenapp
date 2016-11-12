export class UserCredentials {
    email: string;
    password: string;
}

export class UserAccount {
    providerId: string;
    email: string;
    profileComplete: {};
    emailVerified: boolean;
    emailVerificationAttempts: {};
    phoneVerified: boolean;
    phoneVerificationAttempts: {};
    lastTosVersionAccepted: string;
    active: number;
    createdAt: any;
}

export class UserProfile {
    firstName: string;
    lastName: string;
    phonePrefix: string;
    phoneMobile: string;
    photoURL: string;
}