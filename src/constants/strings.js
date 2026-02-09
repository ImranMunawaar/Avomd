export const deeplinkPaths = {
  CDS: "cds",
  ENTERPRISE: "enterprise",
  TEST_MODULE: "testmodule",
  SUBSCRIBE_CHANNEL: "subscribeChannel",
};

export const fontWeight = {
  Thin: "100",
  UltraLight: "200",
  Light: "300",
  Regular: "400",
  Medium: "500",
  Semibold: "600",
  Bold: "700",
  Heavy: "800",
  Black: "900",
};

export const fontFamily = {
  Black: "Inter-Black",
  Bold: "Inter-Bold",
  ExtraLight: "Inter-ExtraLight",
  Light: "Inter-Light",
  Medium: "Inter-Medium",
  SemiBold: "Inter-SemiBold",
  Regular: "Inter-Regular",
  Thin: "Inter-Thin",
  ExtraBold: "Inter-ExtraBold",
  ExtraLightItalic: "Inter-ExtraLightItalic",
  SemiBoldItalic: "Inter-SemiBoldItalic",
  LightItalic: "Inter-LightItalic",
  ThinItalic: "Inter-ThinItalic",
  BoldItalic: "Inter-BoldItalic",
  ExtraBoldItalic: "Inter-ExtraBoldItalic",
  MediumItalic: "Inter-MediumItalic",
  Italic: "Inter-Italic",
  BlackItalic: "Inter-BlackItalic",
};

export const buildVariants = {
  CLIENT: "client",
  COLUMBIA: "columbiapsych",
  PREOP: "preop",
};

export const regex = {
  CHOICE: /\bchoice_\w+_code\b/g,
  MULTI: /\bmulti_\w+_code\b/g,
  MULTI_COUNT: /\bvariable_\w+_code+__count\b/g,
  FORMULA: /\bformula_\w+_code\b/g,
  INFOBOX: /\binfobox_\w+_code\b/g,
  REFERENCE: /\breference_\w+_code\b/g,
  TRIGGER: /\btrigger_\w+_code\b/g,
  VARIABLE: /\bvariable_\w+_code\b/g,
  NUMERIC: /\bnumeric_\w+_code\b/g,
  CUSTOM_NUMERIC: /\bcustomnumeric_\w+_code\b/g,
  CONDITIONAL_TEXT: /\bconditionaltext_\w+_code\b/g,
};
export const EXCLAMATION_MARKS_AT_THE_END = /!*$/;
export const BALLON_ELEVATION = 8;

export const salesRep = {
  HEARTFLOW: "heartflow",
};

export const roundingModes = {
  ROUND: "round",
  CEIL: "ceil",
  FLOOR: "floor",
};
export const EMPTY_STR = "";
export const RECENTLY_ADDED_TIME = 1799999999;

export const LIVE_DB = "https://avomd-playground.firebaseio.com/";
export const STAGING_DB = "https://avomd-playground-dev.firebaseio.com/";

export const sortTypes = {
  ALPHABETICAL: "Alphabetical",
  NEWEST: "Newest",
  LAST_VIEWED: "Last Viewed",
  DEFAULT: "Alphabetical",
};

export const groupPanelType = {
  INPUT: "INPUT",
  DESC: "DESC",
  NO_SUBMIT_INPUT: "NO-SUBMIT-INPUT",
};

export const panelType = {
  DIVIDER: "DIVIDER",
  PRESET: "PRESET",
  DROPDOWN: "DROPDOWN",
  PREDETERMINED: "PREDETERMINED",
  INDICATIONS: "INDICATIONS",
  DESCRIPTION: "DESCRIPTION",
  BETA_DESCRIPTION: "BETA_DESCRIPTION",
  SECTION: "SECTION",
  SEGMENTED: "SEGMENTED",
  SPECIAL: "SPECIAL",
  MULTI: "MULTI",
  FORM: "FORM",
  VERTICAL: "VERTICAL",
  NUMERIC: "NUMERIC",
  VALUELABEL: "VALUELABEL",
  TEXT_INPUT: "TEXT_INPUT",
};
