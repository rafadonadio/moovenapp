import { Injectable } from '@angular/core';

declare var firebase: any;

@Injectable()
export class AccountEmailVerificationService {

    // FIREBASE DATABASE REFERENCES
    fd: any = firebase.database();
    fdRef: any = firebase.database().ref();
    node = '/usersEmailVerificationAttempts/';
    usersEmailVerificationAttemptsRef: any = firebase.database().ref(this.node);


    constructor() {

    }

    /**
     *  FIREBASE EMAIL VERIFICATION
     */
    // set account email value
    // set email verified false
    // send email verification to current user
    // First save the current request and then send the email
    create(user: any) {
        // get db timestamp
        var timestamp = firebase.database.ServerValue.TIMESTAMP;
        // data to set in account
        var basicdata = {
            email: user.email,
            createdAt: timestamp
        };
        // data to set in attempts
        var fulldata = {
            uid: user.uid,
            email: user.email,
            createAt: timestamp,
            verified: 0,
            verifiedConfirmedAt: ''
        };
        // get db new key
        var key = this.fdRef.child('usersEmailVerificationAttempts').push().key;
        // db aupdates array
        var updates = {};
        // set user current email value
        updates['/usersAccount/' + user.uid + '/email/'] = user.email;
        // set email verified to false
        updates['/usersAccount/' + user.uid + '/emailVerified/'] = false;
        // set account attempt data
        updates['/usersAccount/' + user.uid + '/emailVerificationAttempts/' +  key] = basicdata;
        // set attempt full data
        updates[this.node + key] = fulldata;
        // update!
        this.fdRef.update(updates)
            .then(() => {
                console.log('email verification create > ok');
                // send the verification email with firebase
                user.sendEmailVerification();
            })
            .catch((error) => {
                console.log('email verification creation failed ', error.code);
            });
    }

    saveSuccess(user): Promise<any> {
        var self = this;
        var uid = user.uid;
        var emailVerified = user.emailVerified;
        // database reference
        var ref = this.fd.ref('/usersAccount/' + uid + '/emailVerificationAttempts');

        return new Promise((resolve, reject) => {
            // get database value
            ref.limitToFirst(1).on("child_added", function(snapshot) {
                console.log('snapshot.val / snapshot.key', snapshot.val(), snapshot.key);
                // update database value
                var key = snapshot.key;
                var timestamp = firebase.database.ServerValue.TIMESTAMP;
                var updates = {};
                updates['/usersAccount/' + uid + '/emailVerified/'] = emailVerified;
                updates['/usersEmailVerificationAttempts/' + key + '/verified/'] = emailVerified;
                updates['/usersEmailVerificationAttempts/' + key + '/verifiedConfirmedAt/'] = timestamp;
                self.fdRef.update(updates)
                    .then(() => {
                        console.log('updateAccountEmailVerified ok');
                        resolve(true);
                    })
                    .catch((error) => {
                        console.log('updateAccountEmailVerified failed', error);
                        resolve(false);
                    });
                });
            });
    }

}
