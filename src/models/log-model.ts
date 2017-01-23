
export class LogUserEmailVerificationAttempts {
    timestamp: any;
    email: string;
    userId: string;
}



/**
 *  FIREBASE REFERENCES
 */

export const LOG_DB_REF = {
    LOG_USER_EMAIL_VERIFICATION_ATTEMPTS: 'log_UserEmailVerificationAttempts/',
    LOG_USER_EMAIL_VERIFICATION_ATTEMPTS_NODE: 'log_UserEmailVerificationAttempts',
    LOG_SENDINGS_STAGE_UPDATE: 'log_SendingsStageUpdate/',
}