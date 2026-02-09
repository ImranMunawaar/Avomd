import { selectorForPresistData } from "../selectors";
import store from "../store";

export function areVariablesAvailable(variables, variableNames) {
  for (var i = 0; i < variableNames.length; i++) {
    var singleVarName = variableNames[i];
    if (variables[singleVarName] === undefined) {
      return false;
    }
  }
  return true;
}

export function getAllAssociatedVariableNames(formula) {
  try {
    const matches = formula.match(/\[([^\]]*)\]/g);
  } catch (e) {
    crashlytics().recordError(e);
    return [];
  }

  const matches = formula.match(/\[([^\]]*)\]/g);
  var variableNames = [];

  if (matches === null) {
    return [];
  }

  for (var i = 0; i < matches.length; i++) {
    var str = matches[i];
    variableNames.push(str.substring(1, str.length - 1));
  }

  return variableNames;
}

export function getFormulaDescriptionDict(key, variables) {
  if (!getActiveModule()?.contents.formulae) return null;
  const formula = getActiveModule()?.contents.formulae.find(
    ({ id }) => id === key
  );
  var description = "Not Assigned";
  var title = "Untitled";
  var calculationTitle = null;
  var formulaDescription = null;
  var calculationDescription = null;
  var introduction = null;
  var newTextJson = null;

  if (formula) {
    title = formula.title;
    introduction = formula.introduction;
    newTextJson = formula?.newTextJson;
    const value = parseFloat(variables[key]);
    var numericDescribed = Number.isInteger(value)
      ? value.toString()
      : value.toFixed(2);
    description = numericDescribed + " " + (formula.unit ? formula.unit : "");
    calculationTitle = formula.title;

    let formulaToCalculate = getFormulaToCalculate(formula, variables);

    formulaDescription = formulaToCalculate.replace(
      /\[([^\]]*)\]/g,
      (match, p1) => {
        return "[" + getVariableNameByKey(p1, variables) + "]";
      }
    );
    calculationDescription = formulaToCalculate.replace(
      /\[([^\]]*)\]/g,
      (match, p1) => {
        return "[" + parseFloat(variables[p1]).toFixed(2) + "]";
      }
    );
    calculationDescription += " = " + parseFloat(variables[key]).toFixed(1);
  } else {
    return null;
  }

  return {
    title,
    description,
    formulaDescription,
    calculationDescription,
    calculationTitle,
    introduction,
    newTextJson,
  };
}

export function getReferenceIndexByCode(code, isCalc) {
  const presistData = selectorForPresistData(store.getState());
  const { activeCalculator, activeModule } = presistData;

  const active = isCalc ? activeCalculator : activeModule;
  if (!active.contents?.references?.length) return [undefined, undefined];
  const index = active.contents?.references?.findIndex(
    (ref) => ref.id === code
  );
  if (index === -1) return [undefined, undefined];
  const reference = active.contents?.references?.[index];
  return [index, reference];
}
