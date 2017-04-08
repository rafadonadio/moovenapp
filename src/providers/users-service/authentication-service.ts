import { Injectable } from '@angular/core';
import { AngularFire } from 'angularfire2';

import firebase from 'firebase';

@Injectable()
export class AuthenticationService {

    // FIREBASE AUTH REFERENCES
    fbAuthRef: any;
    // angularFire references
    fbuser: any;

    constructor(public af:AngularFire) {
        this.fbAuthRef = firebase.auth();
        // subscribe to user change
        af.auth.subscribe( state => {
            if(state) {
                this.fbuser = state.auth;
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
        this.fbuser = null;
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
        return this.fbuser;
    }

    /**
     *  SETTERS
     */

    createFirebaseUserWithEmailAndPassword(email: string, password: string):Promise<firebase.User> {
        return this.fbAuthRef.createUserWithEmailAndPassword(email, password);
    }

    updateFirebaseUserDisplayName(displayName: string):firebase.Promise<any> {
        let fbuser:firebase.User = this.getFirebaseUser();
        return fbuser.updateProfile({ displayName: displayName, photoURL: fbuser.photoURL });
    }

    updateFirebaseUserPhotoURL(photoURL: string):firebase.Promise<any> {
        let fbuser:firebase.User = this.getFirebaseUser();
        return fbuser.updateProfile({ displayName: fbuser.displayName, photoURL: photoURL });
    }    

    updateFirebaseUserEmail(newEmail: string): firebase.Promise<any>  {
        let fbuser:firebase.User = this.getFirebaseUser();
        return fbuser.updateEmail(newEmail);
    }

    /**
     *  HELPERS
     */

    reloadFirebaseUser(): firebase.Promise<any> {
        var user:firebase.User = this.fbAuthRef.currentUser;
        return user.reload();
    }

}