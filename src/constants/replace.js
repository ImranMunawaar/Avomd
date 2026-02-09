import { EMPTY_STR, EXCLAMATION_MARKS_AT_THE_END } from "../constants/strings";

export function trimLastExc(str) {
  return str?.replace(EXCLAMATION_MARKS_AT_THE_END, EMPTY_STR) || "";
}
