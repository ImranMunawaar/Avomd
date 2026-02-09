import React, { Component } from "react";
import { View, Text, TextInput } from "react-native";
//import { BubbleCard } from "../BubbleCard";
import { BubbleCard } from "../BubbleCardDashboard";
import { isValid } from "../../models/modules";
import Colors from "../../constants/Colors";
import * as Animatable from "react-native-animatable";
import { getHeight, getWidth } from "../../services/helper";
import { getTitle, getUnit } from "../../models/units";
import { fontFamily } from "../../constants/strings";
let viewWidth = 0;
export class DashboardPredetermined extends Component {
  render() {
    let {
      variables,
      item,
      itemKey,
      getVar,
      _this,
      interactWithCalculator,
      setVariable,
      getInputRating,
      styles,
    } = this.props;
    const length = item.value.length;

    return (
      <Animatable.View
        animation="fadeInRight"
        delay={300}
        duration={500}
        key={itemKey}
      >
        {isValid(item.rationale) && (
          <BubbleCard
            answer={false}
            isCalculator={calculator}
            isChatItem={false}
            groupCard={true}
          >
            <Text style={styles.descriptionTextStyle}>{item.rationale}</Text>
          </BubbleCard>
        )}

        <BubbleCard
          answer={false}
          isCalculator={true}
          isChatItem={false}
          groupCard={true}
          full
          style={{
            borderRadius: getHeight(20),
            paddingStart: 0,
            paddingEnd: 0,
            paddingTop: 0,
            paddingBottom: getHeight(27),
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: "#000000",
              fontSize: getHeight(22),
              fontFamily: fontFamily.Bold,
              marginBottom: getHeight(16),
            }}
          >
            {item.title}
          </Text>

          {item.value.map((key, i) => (
            <View
              key={key}
              style={{
                flexDirection: "row",
                marginBottom: item.value.length - 1 === i ? 0 : getHeight(8),
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 4,
                }}
                onLayout={(event) => {
                  //for handle text width
                  const obj = event.nativeEvent.layout;
                  viewWidth = obj.width - 29;
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: getHeight(14),
                    maxWidth: getWidth(viewWidth),
                    color: "#000000",
                    fontFamily: fontFamily.SemiBold,
                  }}
                >
                  {getTitle(key)}
                </Text>
                <Text style={styles.ratingTextStyle}>
                  {getInputRating(key, getVar(key))}
                </Text>
              </View>

              <View style={{ flex: 3.5 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <View style={styles.defaultInputStyle}>
                    <TextInput
                      selectionColor={Colors.borderColor}
                      // ref={key + "__" + i}
                      onChangeText={(inputValue) =>
                        setVariable(key, inputValue)
                      }
                      onEndEditing={() =>
                        interactWithCalculator(`preset input: ${key}`)
                      }
                      value={getVar(key) ? getVar(key) + "" : ""}
                      keyboardType="numeric"
                      returnKeyType="done"
                      clearButtonMode="always"
                      onBlur={() => {
                        const isNextActive = getVar(key) !== "";
                      }}
                      style={{
                        fontWeight: "400",
                        fontSize: getHeight(14),
                        fontFamily: fontFamily.Medium,
                        color: "#000000",
                        textAlign: "center",
                        paddingVertical: getHeight(5),
                        paddingRight: getHeight(30),
                      }}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: getHeight(14),
                      marginStart: getWidth(8),
                      color: "#000000",
                      fontWeight: "400",
                      fontFamily: fontFamily.Regular,
                    }}
                  >
                    {getUnit(key)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </BubbleCard>
      </Animatable.View>
    );
  }
}
