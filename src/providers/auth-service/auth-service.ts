import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

import firebase from 'firebase';

@Injectable()
export class AuthService {

    fbuser: firebase.User;

    constructor(public afAuth: AngularFireAuth) {
        this.firebaseAuthSuscribe();
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
    signOut() {
        this.fbuser = null;
        return firebase.auth().signOut();
    }

    // Sends a password reset email to the given email address.
    sendPasswordResetEmail(email: string): firebase.Promise<any> {
        return firebase.auth().sendPasswordResetEmail(email);
    }
    

    /**
     *  Auth Observable
     */    

    private firebaseAuthSuscribe() {
        // subscribe to user change
        this.afAuth.authState.subscribe( user => {
            if(user) {
                this.fbuser = user;
            }
        });
    }


}