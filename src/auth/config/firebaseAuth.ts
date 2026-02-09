// const AUTH_FIREBASE_API_KEY="AIzaSyBb3e_gAUFe8qlYyEGcvpJtGGak9jC5iN4";
// const AUTH_FIREBASE_AUTH_DOMAIN="avomd-auth.firebaseapp.com";
// const AUTH_FIREBASE_DATABASE_URL="https://avomd-auth.firebaseio.com";
// const AUTH_FIREBASE_PROJECT_ID="avomd-auth";
// const AUTH_FIREBASE_STORAGE_BUCKET="";
// const AUTH_FIREBASE_MESSENGER_SENDER_ID="832989157176";
import Env from "../../constants/Env";
import { LIVE_DB, STAGING_DB } from "../../constants/strings";

const AUTH_FIREBASE_API_KEY = "AIzaSyBRCaegaBgoRHGTG0cL9GhnKTnq4ODqGDw";
const AUTH_FIREBASE_AUTH_DOMAIN = "avomd-playground.firebaseapp.com";
const AUTH_FIREBASE_DATABASE_URL = LIVE_DB;
const AUTH_FIREBASE_PROJECT_ID = "avomd-playground";
const AUTH_FIREBASE_STORAGE_BUCKET = "";
const AUTH_FIREBASE_MESSENGER_SENDER_ID = "241855441634";
const CLOUD_FUNCTION_API_KEY = Env.CLOUD_FUNCTION_API_KEY;

const firebaseAuth = Object.freeze({
  apiKey: AUTH_FIREBASE_API_KEY as string,
  authDomain: AUTH_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: AUTH_FIREBASE_DATABASE_URL as string,
  storageBucket: AUTH_FIREBASE_STORAGE_BUCKET as string,
  projectId: AUTH_FIREBASE_PROJECT_ID as string,
  cloudFunctionApiKey: CLOUD_FUNCTION_API_KEY as string,
});

export default firebaseAuth;
