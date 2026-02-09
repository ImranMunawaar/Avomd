import React, { Component } from "react";
import * as Animatable from "react-native-animatable";
import { BubbleCard } from "../BubbleCardDashboard";
import {
  POSTFIX_SUBMITTED,
  POSTFIX_VALUE,
} from "../../screens/DashboardExports";
import { getActiveModule, isValid } from "../../models/modules";
import GroupDivider from "./GroupDivider";
import { TouchableOpacity, View, Text } from "react-native";
import { checkInputType, getHeight, getWidth } from "../../services/helper";
import {
  calculateFormula,
  filterByTriggerFn,
  updateVariablesFromFormulae,
} from "../../models/formula";
import { defaultVariablesReduced } from "../../models/defaultVariables";
import Colors from "../../constants/Colors";
import { fontFamily, groupPanelType } from "../../constants/strings";

function checkFormComplete(localVariables, filteredGroupItem) {
  return (
    filteredGroupItem?.every((panel) => {
      switch (panel.type) {
        case "INDICATIONS":
        case "BETA_DESCRIPTION":
          return true;
        case "SEGMENTED":
          return localVariables[panel.targetVariable] !== undefined;
        case "MULTI":
          return localVariables[panel.targetVariable + POSTFIX_SUBMITTED] === 1;
        case "PREDETERMINED":
          return (
            Array.isArray(panel.value) &&
            panel.value.every((code) => localVariables[code] !== undefined)
          );
        default:
          return true;
      }
    }) || false
  );
}

export default function GroupForm(props) {
  const { renderSection, item, variables, conditionalObjects, _this } = props;
  const [buffer, setBuffer] = React.useState(
    item.groupItems.reduce(defaultVariablesReduced, { ...variables })
  );
  const [isSubmitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    /**
     * delete form submission from global variables with `undefined`
     */
    const code = item.targetVariable;
    return () => {
      if (code) {
        props.setVariables({
          [code]: undefined,
          [code + POSTFIX_VALUE]: undefined,
        });
      }
    };
    // eslint-disable-next-line
  }, []);
  React.useEffect(() => {
    setBuffer((buffer) => {
      const newBuffer = { ...buffer, ...variables };
      const formulae = getActiveModule()?.contents?.formulae;
      const calculatedBuffer = updateVariablesFromFormulae(newBuffer, formulae);
      return calculatedBuffer;
    });
  }, [variables]);

  React.useEffect(() => {
    if (item.groupType === groupPanelType.NO_SUBMIT_INPUT) {
      const isFormComplete = checkFormComplete(buffer, filteredGroupItem);
      if (isFormComplete && !isSubmitted) {
        submit();
        setSubmitted(true);
      }
    }
  }, [buffer, filteredGroupItem, isSubmitted, submit]);

  const filterByTrigger = React.useCallback(
    function (item) {
      if (filterByTriggerFn(item, buffer)) {
        delete buffer[item.targetVariable];
        return false;
      }
      return true;
    },
    [buffer]
  );

  const filteredGroupItem = React.useMemo(() => {
    const arr = item.groupItems?.filter(filterByTrigger);
    const arr2 = arr?.reduce((acc, cur, index, arr) => {
      const isLastIndex = arr.length === index + 1;
      /** 1. only desc form doesn't have submit btn,
       *  2. submitted form doesn't have submit btn,
       * hence no divider at the end */
      if (isLastIndex && isSubmitted) acc.push(cur);
      else acc.push(cur, { type: "DIVIDER", id: cur.id + "_DIVIDER" });
      return acc;
    }, []);
    return arr2;
  }, [filterByTrigger, item.groupItems, isSubmitted]);

  let allCardAreDescriptionCard = false;

  if (!item.groupType) {
    item.groupType = checkInputType(item.groupItems);
  } else {
    switch (item.groupType) {
      case groupPanelType.DESC:
        allCardAreDescriptionCard = true;
        break;
      case groupPanelType.INPUT:
        break;
      case groupPanelType.NO_SUBMIT_INPUT:
        allCardAreDescriptionCard = true;
        break;
    }
  }

  function setVariable(key, value) {
    const newVar = { [key]: value };
    setVariables(newVar);
  }
  const setVariables = React.useCallback(
    function (newVar) {
      setBuffer((oldVar) => {
        // console.log(oldVar, newVar);
        if (isSubmitted) {
          /** only update newVar when submitted */
          props.setVariables(newVar);
          return { ...oldVar, ...newVar };
        } else {
          const formulae = getActiveModule()?.contents?.formulae;
          const calculatedBuffer = updateVariablesFromFormulae(
            { ...oldVar, ...newVar },
            formulae
          );
          return calculatedBuffer;
        }
      });
    },
    // eslint-disable-next-line
    [setBuffer, isSubmitted]
  );

  function submit() {
    setSubmitted(() => {
      props.setVariables({
        ...buffer,
        [item.targetVariable]: 1,
        [item.targetVariable + POSTFIX_VALUE]: "submitted",
      });
      return true;
    });
  }
  function getVar(key) {
    return buffer[key];
  }
  if (filteredGroupItem?.length) {
    return (
      <>
        {isValid(item.name) && !allCardAreDescriptionCard && (
          <BubbleCard isChatItem item={item} type="group-title">
            <Text
              style={[props.styles.titleTextStyle, { fontSize: getHeight(24) }]}
            >
              {item.name}
            </Text>
          </BubbleCard>
        )}
        <BubbleCard
          isChatItem
          answer={!allCardAreDescriptionCard}
          style={{
            flex: 1,
            paddingBottom: allCardAreDescriptionCard ? 0 : getHeight(27),
          }}
        >
          {allCardAreDescriptionCard && (
            <Text
              style={[
                props.styles.titleTextStyle,
                {
                  marginBottom: getHeight(10),
                  fontSize: getHeight(24),
                  marginStart: 0,
                },
              ]}
            >
              {item.name}
            </Text>
          )}
          <View
            style={{
              marginStart: allCardAreDescriptionCard ? getWidth(10) : 0,
              marginEnd: allCardAreDescriptionCard ? getWidth(10) : 0,
            }}
          >
            {filteredGroupItem.map((singleCard, itemKey) =>
              _this.renderSection(
                singleCard,
                itemKey,
                conditionalObjects,
                filteredGroupItem.length - 1 === itemKey,
                true,
                item.targetVariable,
                {
                  setVariable,
                  setVariables,
                  getVar,
                  variables: buffer,
                  isSubmitted: isSubmitted,
                }
              )
            )}
          </View>
          {!isSubmitted && !allCardAreDescriptionCard && (
            <>
              <GroupDivider />
              <TouchableOpacity
                disabled={!checkFormComplete(buffer, filteredGroupItem)}
                style={[
                  {
                    backgroundColor: !checkFormComplete(
                      buffer,
                      filteredGroupItem
                    )
                      ? "#F4F4F4"
                      : Colors.button,
                    justifyContent: "center",
                    //alignItems: "center",
                    width: getWidth(180),
                    // height: getHeight(39),
                    margin: 0,
                    justifyContent: "center",
                    alignSelf: "center",
                    // backgroundColor: "#F4F4F4",
                    height: getHeight(48),
                    borderRadius: getHeight(48) / 2,
                    //paddingHorizontal: getWidth(24),
                    alignItems: "center",
                  },
                ]}
                onPress={() => {
                  submit();
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.SemiBold,
                    fontWeight: "600",
                    fontSize: getHeight(14),
                    color: "#FFFFFF",
                    lineHeight: getHeight(14),
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </>
          )}
        </BubbleCard>
      </>
    );
  } else return null;
}
