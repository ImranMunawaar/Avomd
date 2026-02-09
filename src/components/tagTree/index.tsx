import React, { useState, useEffect } from "react";
import { Image, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { getHeight, getWidth } from "../../services/helper";
import { fontFamily } from "../../constants/strings";
import Tree from "./Tree";
import images from "../../images";
import { TagNode } from "../../@types/Tags";

export function TagTree({ node }: { node: TagNode }) {
  const [isExpanded, setIsExpanded] = useState(node.expanded);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.expandButton}
      >
        <Text style={styles.expandButtonText}>{node.title}</Text>
        <Image
          style={[styles.expandButtonImage, { alignSelf: "flex-end" }]}
          source={isExpanded ? images.chevron_up : images.chevron_down}
        />
      </TouchableOpacity>
      {isExpanded && <Tree nodes={[node]} isTopLevel allNodes={[node]} />}
    </>
  );
}

const styles = StyleSheet.create({
  expandButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: getHeight(5),
  },
  expandButtonText: {
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(24),
  },
  expandButtonImage: {
    height: getHeight(20),
    width: getHeight(20),
    resizeMode: "contain",
  },
});
