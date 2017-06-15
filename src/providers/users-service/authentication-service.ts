import { Injectable } from '@angular/core';

import firebase from 'firebase';

@Injectable()
export class AuthenticationService {

    // angularFire references
    fbuser: any;

    constructor() {
        // subscribe to user change
        firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                this.fbuser = user;
            }
        });
    }

    /**
     *  SIGNIN/OUT
     */

    // signin firebase user with email and password
    signInWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }

    // Signout firebase user
    // AUTH STATE CHANGE WATCHER will send user to start page
    signOutFromFirebase() {
        this.fbuser = null;
        return firebase.auth().signOut();
    }

    // Sends a password reset email to the given email address.
    sendPasswordResetEmail(email: string): firebase.Promise<any> {
        return firebase.auth().sendPasswordResetEmail(email);
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

    createFirebaseUserWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
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
        var user:firebase.User = firebase.auth().currentUser;
        return user.reload();
    }

}
