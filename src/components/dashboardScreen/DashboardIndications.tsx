import React, { Component } from "react";
import { Text, View, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { ModuleSources } from "@avomd/type-structure/realtimeDB";
import { getActiveModule, isValid } from "../../models/modules";
import { QuestionResources } from "../QuestionResources";
import FormattedText from "../FormattedText";
import { getFormattedDate, getHeight, getWidth } from "../../services/helper";
import { ExampleResources } from "../ExampleResources";
import ModuleSource from "../ModuleSource";
import { ToolResources } from "../ToolResources";
import DraftJsView from "../DraftJsView";
import AssociatedCalculators from "../calculator2Screen/AssociatedCalculators2";
import _ from "lodash";
import { fontFamily } from "../../constants/strings";
import AssociatedCalculatorsV1 from "../calculatorScreen/AssociatedCalculators";
export class DashboardIndications extends Component {
  render() {
    let {
      item,
      itemKey,
      setReference,
      setInfo,
      getVar,
      variables,
      calculatorReports,
      associatedCalculators,
      interactWithContent,
      interactWithProtocol,
      authorDescription,
      _this,
      styles,
      conditionalObjects,
    } = this.props;
    const activeModule = getActiveModule();
    const sources: ModuleSources[] = getActiveModule()?.sources!;
    var date = new Date(activeModule?.serverTimestamp);
    const isNewDescTextJson = _.has(item, "newDescTextJson");
    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        <View style={introStyles.introductionCard}>
          {!activeModule?.isAdminModule && (
            <Text style={introStyles.updatedDate}>
              Updated {getFormattedDate(date)}
            </Text>
          )}

          {isValid(item.descTextJson) || isValid(item.newDescTextJson) ? (
            <View
              style={{
                paddingTop: getHeight(0),
                marginTop: getHeight(10),
                //marginStart: getWidth(5),
              }}
            >
              <DraftJsView
                blocksJSON={
                  isNewDescTextJson ? item.newDescTextJson : item.descTextJson
                }
                _this={this}
                variables={variables}
                setReference={setReference}
                setInfo={setInfo}
                getVar={getVar}
                conditionalObjects={conditionalObjects}
                isIndicationCard
                isNewJson={isNewDescTextJson}
              />
            </View>
          ) : isValid(item.value[0]) ? (
            <View style={{ marginTop: getHeight(7), marginStart: getWidth(5) }}>
              <FormattedText
                text={item.value[0]}
                _this={_this}
                variables={variables}
                isIndicationCard={true}
              />
            </View>
          ) : null}
          {sources && <ModuleSource moduleSources={sources} />}
          {isValid(item.tools) && (
            <ToolResources
              elements={item.tools}
              navigation={_this.props.navigation}
              variables={variables}
              parent={_this}
              interact={(item, value, shouldLog) =>
                interactWithProtocol(`indications ${item}: ${value}`, shouldLog)
              }
              startSpace={0}
            />
          )}
          {isValid(item.examples) && (
            <ExampleResources
              elements={item.examples}
              navigation={_this.props.navigation}
              variables={variables}
              itemKey={itemKey}
              parent={_this}
              insideGreen
              interact={(item, value, shouldLog) =>
                interactWithContent(
                  `page segmented ${item}: ${value}`,
                  shouldLog
                )
              }
            />
          )}
          {!isValid(item.tools) &&
            !isValid(item.examples) &&
            isValid(item.elements) && (
              <QuestionResources
                elements={item.elements}
                navigation={_this.props.navigation}
                variables={variables}
                parent={_this}
                interact={(item, value, shouldLog) =>
                  interactWithProtocol(
                    `indications ${item}: ${value}`,
                    shouldLog
                  )
                }
              />
            )}
          {isValid(authorDescription) && (
            <Text
              style={{
                marginLeft: 0,
                marginVertical: 8,
                fontSize: 12,
                fontWeight: "400",
                color: "gray",
                fontFamily: fontFamily.Regular,
              }}
            >
              {authorDescription}
            </Text>
          )}
        </View>

        <AssociatedCalculatorsV1
          _this={_this}
          associatedCalculators={associatedCalculators}
          calculatorReports={calculatorReports}
          interactWithProtocol={interactWithProtocol}
          interactWith={"indications more"}
        />
        <AssociatedCalculators
          item={item}
          calculatorReports={calculatorReports}
          setInfo={setInfo}
          interactWithProtocol={interactWithProtocol}
        />
      </Animatable.View>
    );
  }
}
let introStyles = StyleSheet.create({
  introductionCard: {
    paddingBottom: getHeight(1),
    elevation: 0,
    paddingHorizontal: getWidth(30),
    paddingTop: getHeight(0),
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: "white",
    marginBottom: getHeight(23),
  },
  defaultStyle: {
    fontSize: getHeight(16),
    fontFamily: fontFamily.Medium,
    fontWeight: "400",
    lineHeight: getHeight(22.72),
  },
  exampleResourcesStyle: {
    marginTop: getHeight(9),
    marginBottom: getHeight(8),
    borderWidth: 1,
    borderColor: "#B2B2B2",
    borderRadius: getHeight(10),
    paddingHorizontal: getWidth(19),
    paddingTop: getHeight(11),
    paddingBottom: getHeight(10),
  },
  updatedDate: {
    fontSize: getHeight(14),
    fontFamily: fontFamily.Italic,
    color: "#A0A0A0",
    lineHeight: getHeight(18),
  },
});
