import React, { Component } from "react";
import { Text, View } from "react-native";
import { isValid } from "../../models/modules";
import DraftJsText from "react-native-draftjs-render/src/components/DraftJsText";
import {
  covertToString,
  updateDraftJsForMentions,
  getDecimalString,
} from "../../services/helper";
import _ from "lodash";
import { regex } from "../../constants/strings";
import { getKeyFromId } from "../../models/units";
import { calculateFormula } from "../../models/formula";

export default class ConditionalText extends Component {
  render() {
    let { item, params, conditionalObjects, variables, isNewJson, getVar } =
      this.props;
    const { contentState, customStyles, navigate } = params;

    let rangeStart = 0,
      remainingText = item.text;
    let emptyConditionalText = false;
    let phoneCounter = 0;
    const views = item.entityRanges.map((entityRange, entityRangeIndex) => {
      let isLast = item.entityRanges.length - 1 === entityRangeIndex;
      let entity = contentState.entityMap[entityRange.key];
      const mentionCode = isNewJson
        ? entity?.data?.mention?.code
        : entity?.data?.mention?.name;
      const mentionName = isNewJson
        ? entity?.data?.mention?.name
        : entity?.data?.mention?.code;

      const conditionalObject =
        conditionalObjects && conditionalObjects[mentionCode];

      let conditionalBlockJSON = { blocks: [], entityMap: {} };
      let isConditional = false;

      if (conditionalObject) {
        isConditional = true;
        let conditionItem = [];
        let conditionsArray = conditionalObject.conditions
          ? conditionalObject.conditions
          : [];
        // switch case when array of conditions exists
        if (conditionsArray.length > 0) {
          // Using for loop so can break the loop when condition true
          for (
            var conditionIndex = 0;
            conditionIndex < conditionsArray.length;
            conditionIndex++
          ) {
            if (
              variables &&
              calculateFormula(
                conditionsArray[conditionIndex].condition,
                variables
              )
            ) {
              conditionItem.push(conditionsArray[conditionIndex]);
              try {
                conditionalBlockJSON = JSON.parse(
                  conditionsArray[conditionIndex].textJson
                );
              } catch (error) {
                console.log("conditionsArray[conditionIndex].textJson", error);
              }
              break;
            }
          }
          // if no condition true the last item is the default item
          if (conditionItem.length === 0) {
            let lastItem = conditionsArray[conditionsArray.length - 1];
            if (lastItem.textJson) {
              try {
                conditionalBlockJSON = JSON.parse(lastItem.textJson);
              } catch (error) {
                console.log("error lastItem.textJson", error);
              }
            }
          }
        }

        // supporting old compatability
        if (
          variables &&
          calculateFormula(conditionalObject.condition, variables)
        ) {
          try {
            conditionalBlockJSON = JSON.parse(
              conditionalObject.conditionalTextJson
            );
          } catch (error) {
            console.log("conditionalObject.conditionalTextJson", error);
          }
        } else if (conditionalObject.defaultTextJson) {
          try {
            conditionalBlockJSON = JSON.parse(
              conditionalObject.defaultTextJson
            );
          } catch (error) {
            console.log("conditionalObject.defaultTextJson", error);
          }
        }
      }
      if (conditionalBlockJSON.blocks.length === 0) {
        remainingText = remainingText.replace(mentionName, "");
      }

      const newInlineStyles = item.inlineStyleRanges.map(({ ...val }, key) => {
        //handle inline Styles for simple text
        const len =
          item.text.length -
          item.text.substring(
            entityRange.offset + entityRange.length,
            item.text.length
          ).length;
        val.offset = val.offset - len;

        return val;
      });
      const isPhone = mentionCode === "phoneNumber";
      if (mentionCode === "phoneNumber") {
        phoneCounter = phoneCounter + 1;
      }
      //to mentions conflicts
      if (!mentionCode.match(regex.CONDITIONAL_TEXT)) {
        let rangeStart = 0;
        let otherMention = false;
        if (
          mentionCode.match(regex.FORMULA) ||
          mentionCode.match(regex.VARIABLE) ||
          mentionCode.match(regex.VARIABLE) ||
          mentionCode.match(regex.REFERENCE) ||
          mentionCode.match(regex.NUMERIC) ||
          mentionCode.match(regex.CUSTOM_NUMERIC)
        ) {
          otherMention = true;
        }

        if (entityRangeIndex !== 0) {
          let prevEntityRange1 = item.entityRanges[entityRangeIndex - 1];
          rangeStart +=
            prevEntityRange1.offset +
            prevEntityRange1.length +
            (otherMention ? 1 : 0);
        }
        // style ranges for the simple item data
        const mentionBeforeDataStyleRanges = item.inlineStyleRanges.map(
          ({ ...val }, key) => {
            //handle inline Styles for simple text
            if (rangeStart <= val.offset + val.length) {
              var offsetDiff = val.offset - rangeStart;
            }

            val.offset = offsetDiff;
            // val.length = val.length + isPhone ? 2 : 0;

            return val;
          }
        );

        const mentionBeforeData = {
          //  key: item.key,
          text: item.text.substring(
            rangeStart,
            entityRange.offset + (isPhone ? 1 : 0)
          ),
          type: item.type,
          data: item.data,
          inlineStyles: mentionBeforeDataStyleRanges,
          entityRanges: [],
          depth: item.depth,
        };

        const mentionData = {
          // key: item.key,
          text: item.text.substring(
            isPhone && !isNewJson ? entityRange.offset - 2 : entityRange.offset,
            entityRange.offset + (isPhone ? 1 : 0) + entityRange.length
          ),
          type: item.type,
          data: item.data,
          inlineStyles: [],
          entityRanges: [],
          depth: item.depth,
        };

        // style range for item Data draft js
        const mentionAfterDataConditionstyleRange = item.inlineStyleRanges.map(
          ({ ...val }, key) => {
            //handle inline Styles for simple text
            const len =
              item.text.length -
              item.text.substring(
                entityRange.offset -
                  (otherMention ? 1 : 0) +
                  entityRange.length,
                item.text.length
              ).length;
            // console.log("val.offset - len", val.offset, len, val.offset - len);
            // val.offset =
            //   parseInt(val.offset - len) >= 0
            //     ? val.offset - len
            //     : val.offset - len;
            val.offset = val.offset - len;

            return val;
          }
        );
        const mentionAfterData = {
          text: item.text.substring(
            entityRange.offset + (isPhone ? 1 : 0) + entityRange.length,
            item.text.length
          ),
          type: item.type,
          data: item.data,
          inlineStyles: mentionAfterDataConditionstyleRange,
          entityRanges: [],
          depth: item.depth,
        };
        const newEntity = _.cloneDeep(entityRange);
        newEntity.offset = isPhone && isNewJson ? 1 : 0;
        mentionData.entityRanges.push(newEntity);
        return (
          <>
            {/* text between mentions and conditional text */}
            <DraftJsText
              {...mentionBeforeData}
              entityMap={contentState.entityMap}
              customStyles={customStyles}
              navigate={navigate}
              textProps={{}}
            />

            {/* draft js for mentions */}
            <DraftJsText
              {...mentionData}
              entityMap={contentState.entityMap}
              customStyles={customStyles}
              navigate={navigate}
              textProps={{}}
            />
            {/* if it's last entity range and there is text after mentions  */}
            {isLast && (
              <DraftJsText
                {...mentionAfterData}
                entityMap={contentState.entityMap}
                customStyles={customStyles}
                navigate={navigate}
                textProps={{}}
              />
            )}
          </>
        );
      }
      if (!conditionalBlockJSON) {
        return null;
      }
      conditionalBlockJSON = updateDraftJsForMentions(
        conditionalBlockJSON,
        variables
      );
      if (entityRangeIndex !== 0) {
        let prevEntityRange = item.entityRanges[entityRangeIndex - 1];
        rangeStart = prevEntityRange.offset + prevEntityRange.length;
      }
      // style range for item Data draft js
      const textDataBeforeConditionstyleRange = item.inlineStyleRanges.map(
        ({ ...val }, key) => {
          //handle inline Styles for simple text
          if (rangeStart <= val.offset + val.length) {
            var offsetDiff = val.offset - rangeStart;
            offsetDiff = parseInt(offsetDiff) > 0 ? offsetDiff : 0;
            val.offset = offsetDiff + (isPhone ? 1 : 0);
          }

          return val;
        }
      );
      const textDataBeforeCondition = {
        //  key: item.key,
        text: item.text.substring(rangeStart, entityRange.offset),
        type: item.type,
        data: item.data,
        inlineStyles: textDataBeforeConditionstyleRange,
        entityRanges: [],
        depth: item.depth,
      };
      const textDataAfterCondition = {
        text: item.text.substring(
          entityRange.offset + entityRange.length,
          item.text.length
        ),
        type: item.type,
        data: item.data,
        inlineStyles: newInlineStyles,
        entityRanges: [],
        depth: item.depth,
      };

      if (
        conditionalBlockJSON.blocks.length === 0 &&
        !isValid(textDataBeforeCondition.text)
      )
        return null;
      return (
        <>
          <DraftJsText
            {...textDataBeforeCondition}
            entityMap={conditionalBlockJSON.entityMap}
            customStyles={customStyles}
            navigate={navigate}
            textProps={{}}
          />

          {conditionalBlockJSON.blocks.map((block, conKey) => {
            let condOffsetDiff = 0;
            let totalBlocks = conditionalBlockJSON.blocks.length;

            const inlineStyleRanges = block.inlineStyleRanges;
            // if there is mentions (Infobox/Variables) inside the conditional text
            block.entityRanges &&
              block.entityRanges
                .sort(
                  (firstItem, secondItem) =>
                    firstItem.offset - secondItem.offset
                )
                .forEach((entityRange, rangeIndex) => {
                  if (entityRange.key === null) return;
                  const entity =
                    conditionalBlockJSON.entityMap[entityRange.key];
                  if (entity.type !== "#mention") return;
                  const mention = entity.data.mention;
                  const mentionCode = isNewJson ? mention.code : mention.name;
                  const mentionName = isNewJson ? mention.name : mention.code;
                  entity.data.url = mentionCode;

                  if (
                    mentionCode.match(regex.NUMERIC) ||
                    mentionCode.match(regex.CUSTOM_NUMERIC)
                  ) {
                    let id = mentionCode.match(regex.CUSTOM_NUMERIC)
                      ? mentionCode
                      : getKeyFromId(mentionCode);
                    let variable = getVar(id);
                    variable = variable ? variable : "";

                    // handle decimal
                    const formulaText = variable
                      ? getDecimalString(
                          mention.decimalPlaces,
                          mention.decimalRounding,
                          variable
                        ) + ""
                      : "";
                    block.text = block.text.replace(mentionCode, formulaText);

                    block.entityRanges[rangeIndex].offset =
                      entityRange.offset - condOffsetDiff;
                    condOffsetDiff +=
                      block.entityRanges[rangeIndex].length - variable.length;

                    block.entityRanges[rangeIndex].length = 0;
                  } else {
                    block.text = block.text.replace(mentionCode, mentionName);

                    block.entityRanges[rangeIndex].offset =
                      entityRange.offset - condOffsetDiff;
                    condOffsetDiff +=
                      block.entityRanges[rangeIndex].length -
                      mentionName.length;
                    entityRange.length = mentionName.length;
                  }
                  inlineStyleRanges &&
                    inlineStyleRanges.forEach(
                      (inlineStyleRange, styleRangeIndex) => {
                        if (inlineStyleRange.offset >= entityRange.offset) {
                          inlineStyleRanges[styleRangeIndex].offset =
                            inlineStyleRange.offset - condOffsetDiff;
                        }
                      }
                    );
                });
            // each block contains one line of content Av-1578 multiline conditional text rendering
            if (conKey != totalBlocks - 1) block.text = block.text + "\n";

            const conditionnalData = {
              //  key: block.key,
              text: block.text,
              type: block.type,
              data: block.data,
              inlineStyles: block.inlineStyleRanges,
              entityRanges: block.entityRanges,
              depth: block.depth,
            };

            if (conditionnalData.text === " ") emptyConditionalText = true;
            return (
              <DraftJsText
                {...conditionnalData}
                entityMap={conditionalBlockJSON.entityMap}
                customStyles={customStyles}
                navigate={navigate}
                textProps={{}}
              />
            );
          })}
          {isLast ? (
            <DraftJsText
              {...textDataAfterCondition}
              entityMap={contentState.entityMap}
              customStyles={customStyles}
              navigate={navigate}
              textProps={{}}
            />
          ) : null}
        </>
      );
    });
    //if empty line then return null
    if (!isValid(remainingText)) return null;
    if (emptyConditionalText) return null;
    return <Text style={customStyles.unstyled}>{views}</Text>;
  }
}
