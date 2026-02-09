import { Amplitude, Identify } from "@amplitude/react-native";
import Env from "../constants/Env";
import mixpanel from "./mixpanel";

let isInitialized = false;
const apiKey = Env.ANALYTICS_API_KEY; // PROD - (AVOMD account) original dev but contains search/more metrics
//const apiKey = 'ec31fcecac8f957aa6bf6f888cbdcdd8'; // DEV - (AvoMD-Prod account)

export enum events {
  // SPLASH SCREEN
  OPEN_APP = "open app",
  AUTO_LOGIN = "auto login",

  // USER ONBOARDING
  VIEW_ONBOARDING_SCREEN = "view onboarding screen",
  CLICK_GOOGLE_SIGNUP_SIGNIN = "click google signup/signin",
  GOOGLE_SIGNUP_SIGNIN_ERROR = "google signup/signin error",
  APPLE_SIGNUP_SIGNIN_ERROR = "apple signup/signin error",
  SIGNUP = "signup",
  SIGNUP_ERROR = "signup error",
  CANCEL_GOOGLE_SIGNUP_SIGNIN = "cancel google signup/signin",
  CLICK_CREATE_ACCOUNT = "click create account",
  CLICK_SIGN_IN_LINK = "click sign in link",
  CLICK_SIGN_UP_LINK = "click sign up link",
  LOGIN = "login",
  LOGIN_ERROR = "login error",
  CLICK_SIGN_IN = "click sign in",
  CLICK_FORGOT_PASSWORD_LINK = "click forgot password link",
  CLICK_CREATE_AN_ACCOUNT_LINK = "click create an account link",
  CLICK_RESET_PASSWORD = "click reset password",
  RESET_PASSWORD = "reset password",
  RESET_PASSWORD_ERROR = "reset password error",

  // USER ADDITIONAL INFO
  VIEW_ADDITIONAL_INFO_SCREEN = "view additional info screen",
  SKIP_ADDITIONAL_INFO = "skip additional info",
  SET_ADDITIONAL_INFO = "set additional info",

  // MODULE SCREEN
  VIEW_MODULE_SCREEN = "view module screen",
  CLICK_OPEN_SIDE_MENU = "click open side menu",
  CLICK_SUBSCRIBE_LINK = "click subscribe link",
  CLICK_SIGN_OUT = "click sign out",
  CLICK_CONTACT_US = "click contact us",
  CLICK_VISIT_OUR_WEBSITE = "click visit our website",
  CLICK_VISIT_COLUMBIA_WEBSITE = "click visit Columbia website",
  CLOSE_SIDE_MENU = "close side menu",
  CLICK_PROTOCOL = "click protocol",
  SEARCH_PROTOCOLS = "search protocols",
  CLICK_FILTER_PROTOCOLS = "click filter protocols",
  CLICK_REMOVE_FILTER_PROTOCOLS = "click remove filter protocols",

  // SUBSCRIPTION SCREEN
  VIEW_SUBSCRIPTION_SCREEN = "view subscription screen",
  EXIT_SUBSCRIPTION_SCREEN = "exit subscription screen",
  CLICK_REMOVE_CHANNEL = "click remove channel",
  CLICK_AVAIALABLE_PUBLIC_CHANNEL = "click available public channel",
  CLICK_RESET_SUBSCRIPTIONS = "click reset subscriptions",
  CONFIRM_RESET_SUBSCRIPTIONS = "confirm reset subscriptions",
  CANCEL_RESET_SUBSCRIPTIONS = "cancel reset subscriptions",
  CLICK_SUBSCRIBE_BUTTON = "click subscribe button",
  ADD_ACTIVE_CHANNEL = "add active channel",
  ADD_ACTIVE_CHANNEL_ERROR = "add active channel error",
  SEARCH_CHANNELS = "search channels",

  // DASHBOARD SCREEN
  VIEW_DASHBOARD_SCREEN = "view dashboard screen",
  EXIT_DASHBOARD_SCREEN = "exit dashboard screen",
  VIEW_DASHBOARD_FROM_SHARE_LINK = "view dashboard from share link",
  // VIEW_SIMULATION_SCREEN = 'view simulation screen',
  INTERACT_WITH_PROTOCOL = "interact with protocol",
  CLICK_QUESTION_RESOURCE = "click question resource",
  OPEN_INFORMATION_MODAL = "open information modal",
  CLOSE_INFORMATION_MODAL = "close information modal",
  CLICK_REFERENCE_LINK = "click reference link",
  CLICK_CALCULATOR_BUTTON = "click calculator button",
  CLICK_TAP_TO_READ = "click tap to read",
  CLICK_CHOICE = "click choice",
  DESCRIPTION_CARD_TOGGLED = "description card toggled",
  READING_DESCRIPTION_CARD = "reading description card",
  NOTE_READ = "note read",
  LEAVE_A_MODULE = "leave a module",

  // CALCULATOR SCREEN
  VIEW_CALCULATOR_SCREEN = "view calculator screen",
  // CALCULATOR_SIMULATION = 'calculator simulation screen',
  EXIT_CALCULATOR_SCREEN = "exit calculator screen",
  INTERACT_WITH_CALCULATOR = "interact with calculator",
  CLICK_SUBMIT_CALCULATOR = "click submit calculator",

  // CONTENT SCREEN
  VIEW_CONTENT_SCREEN = "view content screen",
  EXIT_CONTENT_SCREEN = "exit content screen",
  CLICK_DISCLAIMER_BUTTON = "click disclaimer button",
  INTERACT_WITH_CONTENT = "interact with content",
  CLICK_HELP_BUTTON = "click help button",
  CLICK_HELP_WEB_BUTTON = "click help web button",
  CLICK_HELP_MAIL_BUTTON = "click help mail button",
  CLICK_HELP_THUMBS_UP_BUTTON = "click help thumbs up button",
  CLICK_HELP_FEEDBACK_BUTTON = "click help feedback button",
  OPEN_REFERENCE_MODAL = "open reference modal",
  CLOSE_REFERENCE_MODAL = "close reference modal",

  // Formula Modal
  CLOSE_FORMULA_MODAL = "close formula modal",

  // custom numerics Modal
  CLOSE_CUSTOM_NUMERICS_MODAL = "close custom numerics modal",

  // numerics Modal
  CLOSE_NUMERICS_MODAL = "close numerics modal",

  // MISC
  OPEN_DEEPLINK = "open deeplink",
  // ACTIVATE_AVOMD = 'clicked active avoMD',
  // OPEN_ENTERPRISE_LINK = 'open enterprise link',
  // OPEN_WEB_APP_ENTERPRISE = 'open web-app enterprise',
  // OPEN_MAGIC_LINK = 'open magic-link',
  // OPEN_WEB_LINK = 'open web-link',

  //Payment screen analytics
  CLICK_TRY_ONCE = "Try once used",
  CLICK_START_NOW = "After payment start now with sign up",
  CLICK_INSTITUTIONAL_PLAN = "Institutional plan clicked",
  CLICK_INDIVIDUAL_PLAN = "Click individual plan",
  REDEEM_CODE_NOT_EXIST = "Redeem code not exist",
  SUBSCRIPTION_FAILED = "Subscription failed ",
  IAPHUD_TRANSACTION = "IAPhub transaction",
  IAPHUB_PAYMENT_DETAILS = "IAPhub payment details",
  IAPHUB_PURCHASE_RESTORE = "IAPhub purchase restore",

  //My Profile Screen
  DELETE_ACCOUNT = "Deleting Account",
}

const canUseAmplitude = apiKey; //Environment.isProduction && apiKey;
const ampInstance = Amplitude.getInstance();

export function initialize(): void {
  if (isInitialized || !canUseAmplitude) {
    return;
  }
  ampInstance.init(apiKey);
  isInitialized = true;
}

export function identify(id: string | null, options?: any) {
  initialize();
  if (!canUseAmplitude) return;
  if (id) {
    mixpanel.identify(id);
    ampInstance.setUserId(id);
    if (options) {
      for (let [key, value] of Object.entries(options)) {
        mixpanel.getPeople().set(key, value);
      }
      ampInstance.setUserProperties(options);
    }
  } else {
    ampInstance.clearUserProperties();
  }
}

export function track(event: string, options?: any): void {
  initialize();
  if (!canUseAmplitude) return;

  if (options) {
    mixpanel.track(event, options);
    ampInstance.logEvent(event, options);
  } else {
    mixpanel.track(event);
    ampInstance.logEvent(event);
  }
}
export function reset() {
  mixpanel.reset();
  // Amplitude.resetSessionId();
}
export default {
  events,
  initialize,
  identify,
  track,
};
