import { Injectable } from '@angular/core';

declare var firebase: any;

@Injectable()
export class AuthenticationService {

    // FIREBASE AUTH REFERENCES
    fbAuth: any = firebase.auth;
    authRef: any = firebase.auth();

    constructor() {}


    /**
     *  SIGNIN/OUT
     */

    // signin firebase user with email and password
    signInWithEmailAndPassword(email: string, password: string): Promise<any> {
        return this.authRef.signInWithEmailAndPassword(email, password);
    }

    // Signout firebase user
    // AUTH STATE CHANGE WATCHER will send user to start page
    signOutFromFirebase() {
        return this.authRef.signOut();
    }

    // authentication state change watcher
    onAuthStateChanged(callback) {
        return this.authRef.onAuthStateChanged(callback);
    }

    // Sends a password reset email to the given email address.
    sendPasswordResetEmail(email: string): Promise<void> {
        return this.authRef.sendPasswordResetEmail(email);
    }


    /**
     *  GETTERS
     */

    getCurrentFirebaseUser() {
        return this.authRef.currentUser;
    }


    /**
     *  SETTERS
     */

    createFirebaseUserWithEmailAndPassword(email: string, password: string) {
        return this.authRef.createUserWithEmailAndPassword(email, password);
    }

    updateFirebaseUserDisplayName(displayName: string) {
        var user = this.getCurrentFirebaseUser();
        return user.updateProfile({
                displayName: displayName
            });
    }

    // update authenticated user email
    updateEmail(user: any, newEmail: string): Promise<any> {
        return user.updateEmail(newEmail);
    }


    /**
     *  HELPERS
     */

    reloadCurrentFirebaseUser() {
        var user = this.authRef.currentUser;
        return user.reload();
    }

}
