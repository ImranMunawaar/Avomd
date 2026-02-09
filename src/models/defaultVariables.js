import { POSTFIX_ASSIGNED, POSTFIX_VALUE } from "../screens/DashboardExports";
import { checkInputType } from "../components/group/groupType";
import { getActiveModule } from "../models/modules";

export const setDefaultChoice = (card) => {
  const targetVariable = card?.targetVariable;
  if (!targetVariable) return;
  const items = card?.items || [];
  const newVar = {};
  items.forEach((item, index) => {
    if (item?.isSelected) {
      newVar[targetVariable] = index;
      newVar[targetVariable + POSTFIX_VALUE] = item?.label;
      newVar[targetVariable + POSTFIX_ASSIGNED] = item.coefficient || 0;
    }
  });
  return newVar;
};

/** deprecated, but support backward compatibility */
export const setDefaultValues = (card) => {
  const targetVariable = card.targetVariable;
  if (!targetVariable) return;
  const newVar = {};
  if (Array.isArray(card.value)) {
    card?.value?.forEach((value, i) => {
      if (typeof value === "string") {
        if (value.trim().endsWith("!")) {
          // Default Value!
          newVar[targetVariable] = i;
          newVar[targetVariable + POSTFIX_VALUE] = value.replace("!", "");
        }
      }
    });
    return newVar;
  } else {
    return;
  }
};

export function getDefaultVariables() {
  const module = getActiveModule();
  return module.contents?.dashboard?.reduce(defaultVariablesReduced, {}) || {};
}

export function defaultVariablesReduced(vars, card) {
  switch (card.type) {
    case "SEGMENTED":
      const v1 = setDefaultValues(card);
      const v2 = setDefaultChoice(card);
      Object.assign(vars, v1, v2);
      return vars;
    /** manually set `groupType` */
    case "FORM":
      const groupCard = card;
      const isInputType = checkInputType(groupCard.groupItems);
      if (isInputType) {
        groupCard.groupType = "INPUT";
      } else {
        groupCard.groupType = "DESC";
      }
  }
  return vars;
}
