import React from "react";
import { View, Pressable, Text } from "react-native";
import { isValid } from "../models/modules";
import { BubbleCard } from "./BubbleCard";
import { SegmentedButton } from "./SegmentedButton";
import Colors from "../constants/Colors";

const SegmentedButtonGeneric = (props) => {
  const { elements, subtitles, getValue, onValueChange } = props;
  console.log(subtitles);
  const shouldShowAsColumn =
    elements.length > 5 ||
    elements.some((value) => value.length > 55) ||
    elements.join().length > 55;

  return (
    <View style={{ flexDirection: "column" }}>
      <View
        style={{
          alignSelf: "center",
          justifyContent: "center",
          flexDirection: shouldShowAsColumn ? "column" : "row",
          marginTop: 10,
          marginBottom: 0,
          minWidth: 280,
          flex: 1,
          borderRadius: 6,
        }}
      >
        {elements.map((value, key) => {
          const active = getValue() === key;
          const isFirst = key === 0;
          const isLast = key === elements.length - 1;
          return (
            <Pressable
              key={key}
              first={isFirst}
              last={isLast}
              active={active}
              small
              success={active}
              style={{
                borderTopLeftRadius:
                  (shouldShowAsColumn && isFirst) ||
                  (!shouldShowAsColumn && isFirst)
                    ? 6
                    : 1,
                borderTopRightRadius:
                  (shouldShowAsColumn && isFirst) ||
                  (!shouldShowAsColumn && isLast)
                    ? 6
                    : 1,
                borderBottomLeftRadius:
                  (shouldShowAsColumn && isLast) ||
                  (!shouldShowAsColumn && isFirst)
                    ? 6
                    : 1,
                borderBottomRightRadius:
                  (shouldShowAsColumn && isLast) ||
                  (!shouldShowAsColumn && isLast)
                    ? 6
                    : 1,
                alignSelf: "stretch",
                justifyContent: "center",
                marginBottom: key < elements.length - 1 ? -1 : 0,
                borderWidth: 0.5,
                borderColor: Colors.infoBoxThemeColor,
                maxHeight: 50,
                backgroundColor: active ? Colors.infoBoxThemeColor : "white",
                shadowOpacity: 0,
                minWidth: 40,
                flexGrow: 1,
              }}
              onPress={() => {
                onValueChange(key);
              }}
            >
              <Text
                numberOfLines={1}
                uppercase={false}
                style={{
                  color: active ? "white" : Colors.infoBoxThemeColor,
                  fontSize: 11,
                }}
              >
                {value.replace("!", "")}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {subtitles && isValid(getValue()) && (
        <Text
          style={{
            marginTop: 3,
            marginLeft: 12,
            fontSize: 12,
            fontWeight: "500",
            color: "#EA8065",
          }}
        >
          {subtitles[getValue()]}
        </Text>
      )}
      {subtitles && !isValid(getValue()) && (
        <Text
          style={{
            marginTop: 3,
            marginLeft: 12,
            fontSize: 12,
            fontWeight: "500",
            color: "#FF9E7E",
          }}
        >
          Not Selected
        </Text>
      )}
    </View>
  );
};

export { SegmentedButtonGeneric };
