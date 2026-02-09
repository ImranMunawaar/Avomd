import React, { Component } from "react";
import { TouchableOpacity, Text } from "react-native";
import styles from "./styles";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { getDateString } from "../../models/modules";

const ModuleItem =
  ({
     module,
     isLast,
     isFirst,
     onModulePress
   }) => {
    if (!module)
      return null;
    return (
      <TouchableOpacity
        onPress={onModulePress}
        key={module.code}
        style={[styles.cardStyle, {
          marginBottom: isLast ? 35 : styles.cardStyle.marginBottom,
          marginTop: isFirst ? 28 : 0
        }]}>
        <Text style={styles.titleText}>{module.title}</Text>
        <Text style={styles.authorText}>{module.author ? module.author : "Joongheum Park, MD, et.al."}</Text>
        <Text style={styles.timeText}>
          Updated{" "}
          {module.serverTimestamp &&
          getDateString(Date.now() - module.serverTimestamp)}{" "}
          ago.
        </Text>
        {module.description && <Text numberOfLines={3} style={styles.descriptionText}>{module.description}</Text>}
      </TouchableOpacity>
    );
  };

export default ModuleItem;
