import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  PanResponder,
} from "react-native";
import { getHeight, getWidth } from "../../services/helper";
import { fontFamily } from "../../constants/strings";
import { TagNode, TreeProps } from "../../@types/Tags";
import { useSetAtom } from "jotai";
import {
  tagPartialSelectedAtom,
  tagSelectedAtom,
} from "../../modals/FilterByTagsModal";
import {
  checkType,
  hasChildren,
  getCheckboxImage,
  getParentNode,
  toggleChecked,
} from "../../utils/tree";
import images from "../../images";

const Tree: React.FC<TreeProps> = ({ nodes, isTopLevel, allNodes }) => {
  const [expanded, setExpanded] = useState(!!nodes[0]?.expanded);
  const setSelectedTags = useSetAtom(tagSelectedAtom);
  const setPartialSelectedTags = useSetAtom(tagPartialSelectedAtom);

  const updateChildren = (node: TagNode, selected: string): void => {
    node.selected = selected;
    onCheckHandler(node.code, selected);
    if (node.children) {
      node.children.forEach((child) => updateChildren(child, selected));
    }
  };

  const updateParentNodes = (nodes: TagNode[], childNode: TagNode): void => {
    const parentNode = getParentNode(nodes, childNode);
    if (parentNode) {
      if (
        parentNode.children?.every(
          (child) => child.selected === checkType.CHECKED
        )
      ) {
        parentNode.selected = checkType.CHECKED;
        onCheckHandler(parentNode.code, checkType.CHECKED);
      } else if (
        parentNode.children?.every(
          (child) => child.selected === checkType.UNCHECKED
        )
      ) {
        parentNode.selected = checkType.UNCHECKED;
        onCheckHandler(parentNode.code, checkType.UNCHECKED);
      } else if (
        parentNode.children?.some(
          (child) =>
            child.selected === checkType.CHECKED ||
            child.selected === checkType.PARTIAL
        )
      ) {
        parentNode.selected = checkType.PARTIAL;
        onPartialCheckHandler(parentNode.code);
        onCheckHandler(parentNode.code, checkType.PARTIAL);
      }
      updateParentNodes(nodes, parentNode);
    }
  };

  const onCheckHandler = (tagCode: string, selected: string) => {
    setSelectedTags((prevSelectedTags) => {
      const updatedSelectedTags = [...prevSelectedTags];
      const index = updatedSelectedTags.indexOf(tagCode);
      if (index > -1) {
        updatedSelectedTags.splice(index, 1);
      } else if (selected === checkType.CHECKED) {
        updatedSelectedTags.push(tagCode);
      }
      return updatedSelectedTags;
    });
  };
  const onPartialCheckHandler = (tagCode: string) => {
    setPartialSelectedTags((prevPartialTags) => {
      const updatedPartialTags = [...prevPartialTags];
      const index = updatedPartialTags.indexOf(tagCode);
      if (index > -1) {
        updatedPartialTags.splice(index, 1);
      } else {
        updatedPartialTags.push(tagCode);
      }
      return updatedPartialTags;
    });
  };

  const handlePress = () => {
    setExpanded(!expanded);
  };

  const handleCheck = (item: TagNode) => {
    updateChildren(item, toggleChecked(item.selected || ""));
    updateParentNodes(allNodes, item);
  };

  const renderItem = ({ item }: { item: TagNode }) => {
    if (!item.code) {
      return null;
    }

    return (
      <View style={{ marginStart: isTopLevel ? 0 : getWidth(20) }}>
        <TouchableOpacity
          onPress={() => handlePress()}
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: getHeight(6),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {hasChildren(item) && (
              <Image
                style={styles.expandButtonImage}
                source={expanded ? images.caret_down : images.caret_right}
              />
            )}
            {!isTopLevel && !item.children && (
              <View style={styles.expandButtonPlaceholder} />
            )}
            <TouchableOpacity
              hitSlop={getHeight(5)}
              style={styles.checkbox}
              onPress={() => handleCheck(item)}
            >
              <Image
                style={styles.checkboxImage}
                source={getCheckboxImage(item.selected || "")}
              />
            </TouchableOpacity>
            <Text style={styles.nodeName}>{item.titleWithCount}</Text>
          </View>
        </TouchableOpacity>
        {expanded &&
          item.children &&
          item.children.map((child) => {
            return (
              <Tree nodes={[child]} isTopLevel={false} allNodes={allNodes} />
            );
          })}
      </View>
    );
  };

  return (
    <FlatList
      data={nodes}
      keyExtractor={(item) => item.code}
      renderItem={renderItem}
      extraData={expanded}
      nestedScrollEnabled={false}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      removeClippedSubviews={true}
    />
  );
};

const styles = StyleSheet.create({
  expandButton: {},
  expandButtonImage: {
    height: getHeight(20),
    width: getHeight(20),
    resizeMode: "contain",
  },
  expandButtonPlaceholder: {
    width: getHeight(21),
  },
  checkbox: {},
  checkboxImage: {
    height: getHeight(25),
    width: getHeight(25),
    resizeMode: "contain",
  },
  nodeName: {
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
    marginStart: getWidth(8),
    lineHeight: getHeight(20),
  },
});
export default Tree;
