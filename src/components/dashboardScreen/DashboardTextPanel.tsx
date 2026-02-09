import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { getHeight, getWidth } from "../../services/helper";
import { BubbleCard } from "../BubbleCardDashboard";
import { fontFamily } from "../../constants/strings";
import {
  POSTFIX_SUBMITTED,
  POSTFIX_VALUE,
} from "../../screens/DashboardExports";

export function DashboardTextPanel({
  item,
  setVariables,
  styles,
  openFullTextPanel,
}) {
  const [text, onChangeText] = React.useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitTextInputValue = (textVlue) => {
    const newVar = {
      [item.targetVariable]: 1,
      [item.targetVariable + POSTFIX_VALUE]: textVlue,
      [item.targetVariable + POSTFIX_SUBMITTED]: 1,
    };
    setVariables?.(newVar);
  };

  return (
    <Animatable.View
      animation="fadeInRight"
      delay={150}
      duration={300}
      key={item.id}
    >
      <Text
        style={[
          styles.titleTextStyle,
          { marginStart: getWidth(30), marginBottom: getHeight(10) },
        ]}
      >
        {item.title}
      </Text>
      <BubbleCard
        style={{
          height: getHeight(130),
          flex: 1,
          flexDirection: "row",
          borderColor: isFocused ? "#A5E5D7" : "white",
          borderWidth: 0.5,
          paddingTop: getHeight(20),
          paddingBottom: getHeight(20),
          backgroundColor: isSubmitted ? "#F5F8F9" : "white",
        }}
        isChatItem
      >
        <TextInput
          style={textPanelStyle.fieldInput}
          placeholder={"Start typing"}
          multiline
          numberOfLines={4}
          scrollEnabled
          editable={!isSubmitted}
          onChangeText={onChangeText}
          value={text}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <View
          style={{ justifyContent: "space-between", alignItems: "flex-end" }}
        >
          <TouchableOpacity
            hitSlop={getHeight(10)}
            onPress={() => {
              openFullTextPanel({
                title: item.title,
                text,
                setIsFocused,
                setIsSubmitted,
                isSubmitted,
                onChangeText,
                submitTextInputValue,
              });
            }}
          >
            <Image
              style={textPanelStyle.expandButtonImage}
              source={require("../../images/expandbutton.png")}
            />
          </TouchableOpacity>
          {!isSubmitted && (
            <TouchableOpacity
              style={{ alignSelf: "flex-end" }}
              hitSlop={getHeight(15)}
              onPress={() => {
                setIsSubmitted(true);
                Keyboard.dismiss();
                setIsFocused(false);

                submitTextInputValue(text);
              }}
            >
              <Image
                style={textPanelStyle.sendButtonImage}
                source={{ uri: isFocused ? "sendbuttonenabled" : "sendbutton" }}
              />
            </TouchableOpacity>
          )}
        </View>
      </BubbleCard>
    </Animatable.View>
  );
}
const textPanelStyle = StyleSheet.create({
  fieldInput: {
    flex: 1,
    color: "#1E1F20",
    lineHeight: getHeight(20),
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
    marginEnd: getWidth(10),
    paddingTop: 0,
  },
  sendButtonImage: { width: getHeight(20), height: getHeight(20) },
  expandButtonImage: { width: getHeight(12), height: getHeight(12) },
});
