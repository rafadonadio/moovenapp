import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Injectable()
export class AuthenticationService {

    // FIREBASE AUTH REFERENCES
    fbAuthRef: any = firebase.auth();
    // angularFire references
    fireAuth: any;

    constructor(public af:AngularFire) {
        // subscribe to user change
        af.auth.subscribe( user => {
            if(user) {
                this.fireAuth = user.auth;
            }
        });
    }

    /**
     *  SIGNIN/OUT
     */

    // signin firebase user with email and password
    signInWithEmailAndPassword(email: string, password: string): any {
        return this.af.auth.login({ email: email, password: password });
    }

    // Signout firebase user
    // AUTH STATE CHANGE WATCHER will send user to start page
    signOutFromFirebase() {
        return this.fbAuthRef.signOut();
    }

    // Sends a password reset email to the given email address.
    sendPasswordResetEmail(email: string): Promise<void> {
        return this.fbAuthRef.sendPasswordResetEmail(email);
    }

    /**
     *  GETTERS
     */

    getFirebaseUser() {
        return this.fbAuthRef.currentUser;
    }

    /**
     *  SETTERS
     */

    createFirebaseUserWithEmailAndPassword(email: string, password: string):Promise<firebase.User> {
        return this.fbAuthRef.createUserWithEmailAndPassword(email, password);
    }

    updateFirebaseUserDisplayName(displayName: string):firebase.Promise<any> {
        let fbuser:any = this.getFirebaseUser();
        return fbuser.updateProfile({ displayName: displayName });
    }

    updateFirebaseUserEmail(user: any, newEmail: string): Promise<any> {
        return user.updateEmail(newEmail);
    }

    /**
     *  HELPERS
     */

    reloadFirebaseUser() {
        var user = this.fbAuthRef.currentUser;
        return user.reload();
    }

}
