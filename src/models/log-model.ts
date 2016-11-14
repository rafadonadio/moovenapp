
export class LogUserEmailVerificationAttempts {
    timestamp: number;
    email: string;
    userId: string;
}



/**
 *  FIREBASE REFERENCES
 */

export const LOG_DB_REF = {
    LOG_USER_EMAIL_VERIFICATION_ATTEMPTS: 'log_UserEmailVerificationAttempts/',
    LOG_USER_EMAIL_VERIFICATION_ATTEMPTS_NODE: 'log_UserEmailVerificationAttempts'
}