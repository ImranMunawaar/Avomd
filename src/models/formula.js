import {
  areVariablesAvailable,
  getAllAssociatedVariableNames,
} from "./moduleExports";
import crashlytics from "@react-native-firebase/crashlytics";
// import { FORMUA_IN_BETWEEN_BRACES, IN_BETWEEN_BRACES } from "../utils/regex";
const IN_BETWEEN_BRACES = /\[([^\]]*)\]/g;
const FORMUA_IN_BETWEEN_BRACES = /\[formula_([^\]]*)\]/g;

//Moved here from modules.js
export function calculateFormula(
  formula,
  variables,
  { returnBool = false, shouldAllVariablesAvailable = false } = {}
) {
  this.variables = variables;
  formula = formula?.replace(" or ", " || ");
  if (formula === "") return returnBool ? true : null;
  if (shouldAllVariablesAvailable) {
    const variableNames = getAllAssociatedVariableNames(formula);
    if (areVariablesAvailable(variables, variableNames) === false) {
      return null;
    }
  }

  const exchangedVars = formula?.replace(IN_BETWEEN_BRACES, (substring, p1) => {
    if (variables[p1] == null) return `variables.${p1}`;
    return `Number(variables.${p1})`;
  });
  try {
    // eslint-disable-next-line no-eval
    const res = eval(exchangedVars);
    return returnBool ? Boolean(res) : res;
  } catch (e) {
    crashlytics().recordError(e);
    console.log("calculateFormula error", e.message);
    return returnBool ? false : null;
  }
}

export function getAssociatedFormulaNames(formula) {
  try {
    const matches = formula.match(FORMUA_IN_BETWEEN_BRACES);
    if (matches === null) return [];
    return matches.map((str) => str.substring(1, str.length - 1));
  } catch (e) {
    return [];
  }
}
export const getMaybeConditionalFormula = (formula, variables) => {
  if (!formula.isConditional) return formula;
  const conditionalFormula = formula.conditionalFormulas?.find(
    (conditionalFormula) => {
      /** default formula always come at last in array */
      if (conditionalFormula.isDefault) return true;
      const positive = calculateFormula(
        conditionalFormula.condition,
        variables,
        {
          returnBool: true,
        }
      );
      return positive;
    }
  );
  return conditionalFormula;
};
export const updateVariablesFromFormulae = (variables, formulae) => {
  if (!formulae) return variables;
  const formulaArr = [...formulae];
  function assignFormula(formula) {
    const maybeConditionalFormula = getMaybeConditionalFormula(
      formula,
      variables
    );
    if (!maybeConditionalFormula) return delete variables[formula.id];
    const dependantFormulae = getAssociatedFormulaNames(
      maybeConditionalFormula.formula
    );
    if (isDependantFormula(formulaArr, dependantFormulae)) return null;
    const calculated = calculateFormula(
      maybeConditionalFormula.formula,
      variables,
      {
        shouldAllVariablesAvailable: true,
      }
    );
    if (calculated === null) return delete variables[formula.id];
    variables[formula.id] = calculated;
    return true;
  }
  while (formulaArr.length) {
    const formula = formulaArr.shift();
    if (!formula) continue;
    const res = assignFormula(formula);
    if (res === null) formulaArr.push(formula);
  }
  return variables;
};

export function isDependantFormula(arr, ids = []) {
  const formulaIds = arr.map((formula) => formula.id);
  return ids.some((id) => formulaIds.includes(id));
}

export function filterByTriggerFn(item, variables) {
  const returnBool = true;
  const isDisplayed = calculateFormula(item.positiveTrigger, variables, {
    returnBool,
  });

  /** dependency key is not being used anymore so, removing it for
   * now. uncomment below code and remove return !isDisplayed; to add it
   * back */

  /* const noDependency =
    item.dependency && variables[item.dependency] === undefined;
  return !isDisplayed || noDependency; */

  return !isDisplayed;
}
