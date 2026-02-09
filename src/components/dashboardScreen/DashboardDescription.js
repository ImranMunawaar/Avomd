import React, { Component } from "react";
import { Text, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { isValid } from "../../models/modules";
import { BubbleCard } from "../../components/BubbleCardDashboard";
import { QuestionResources } from "../../components/QuestionResources";
import { getHeight, getWidth } from "../../services/helper";
import { ExampleResources } from "../../components/ExampleResources";
import { ToolResources } from "../../components/ToolResources";
import { SvgXml } from "react-native-svg";
import svgs from "../../constants/svgs";
import { fontFamily } from "../../constants/strings";

export class DashboardDescription extends Component {
  constructor(props) {
    super(props);
    //this.state = { isOn: true };
  }
  render() {
    let { item, itemKey, variables, interactWithProtocol, _this, styles } =
      this.props;
    const isAction = item.descriptionType === "action";

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={item.id}
      >
        <BubbleCard
          isChatItem
          style={{
            paddingBottom: isValid(item.elements)
              ? getHeight(16)
              : getHeight(27),
            flex: 1,
          }}
        >
          {isValid(item.title) && (
            <View
              style={{
                paddingBottom: 0,
                marginBottom: 8,
                flexDirection: "row",
                marginStart: getWidth(5),
              }}
            >
              {isAction && (
                <SvgXml
                  style={{
                    marginEnd: getWidth(9),
                    marginTop: getHeight(1),
                  }}
                  xml={svgs.bolt}
                  width={getHeight(21)}
                  height={getHeight(21)}
                />
              )}
              {/*{isAction && <Image
                style={{
                  height: getHeight(21),
                  width: getHeight(21),
                  resizeMode: "contain",
                  marginEnd: getWidth(9)
                }}
                source={{uri: 'exclamation'}}/>}*/}
              <Text style={styles.questionTitleTextStyle}>{item.title}</Text>
            </View>
          )}
          {isValid(item.value[0]) && (
            <Text
              style={{
                fontSize: getHeight(16),
                lineHeight: getHeight(21.6),
                fontFamily: fontFamily.Regular,
                fontWeight: "400",
                marginStart: getWidth(5),
                color: "#515151",
              }}
            >
              {item.value[0]}
            </Text>
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
                _this.interactWithContent(
                  `page segmented ${item}: ${value}`,
                  shouldLog
                )
              }
            />
          )}

          {isValid(item.tools) && (
            <ToolResources
              elements={item.tools}
              navigation={_this.props.navigation}
              variables={variables}
              parent={_this}
              interact={(item, value, shouldLog) =>
                interactWithProtocol(`description ${item}: ${value}`, shouldLog)
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
                    `description ${item}: ${value}`,
                    shouldLog
                  )
                }
              />
            )}
        </BubbleCard>
      </Animatable.View>
    );
  }
}
