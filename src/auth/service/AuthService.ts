//import * as Facebook from "expo-facebook";

import { config } from "../config";

export default class AuthService {
  /**
   * Login with Facebook and Firebase
   *
   * Uses Expo Facebook API and authenticates the Facebook user in Firebase
   */

  public static async loginWithFacebook() {
    // const { type, token } = await Facebook.logInWithReadPermissionsAsync(
    //   config.facebookAuth.appId,
    //   { permissions: ["public_profile", "email"] }
    // );
    //if (type === "success" && token) {
    // Build Firebase credential with the Facebook access token.
    //const credential = firebase.auth.FacebookAuthProvider.credential(token);
    // await firebaseAuthIntegration
    //   .auth()
    //   .signInWithCredential(credential);
    //}
  }

  /**
   * Register a subscription callback for changes of the currently authenticated user
   *
   * @param callback Called with the current authenticated user as first argument
   */
}
