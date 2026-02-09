import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
  ScrollView,
} from "react-native";
import Modal from "react-native-modal";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import { connect } from "react-redux";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { getHeight, getWidth } from "../services/helper";
import { fontFamily } from "../constants/strings";
import { getBottomSpace, getStatusBarHeight } from "../services/iphoneXHelper";
import Layout from "../constants/Layout";
import { selectors } from "../store";
import { TagCounts, TagLabels, TagNode } from "../@types/Tags";
import { useTagTree } from "../hooks/useTagTree";
import { TagTree } from "../components/tagTree";
import { checkType } from "../utils/tree";
import GenericInfoModal from "./GenericInfoModal";

export const tagLabelsAtom = atom<TagLabels>({});
export const tagCountsAtom = atom<TagCounts>(new Map());

export const tagCodeArrAtom = atom<string[]>([]);
export const tagSelectedAtom = atom<string[]>([]);
export const tagPartialSelectedAtom = atom<string[]>([]);
export const tagResetAtom = atom(null, (get, set) => {
  set(tagCodeArrAtom, []);
  set(tagSelectedAtom, []);
  set(tagPartialSelectedAtom, []);
});

const FilterByTagsModal = ({
  isOpen,
  closeModal,
  teamCode,
}: {
  isOpen: boolean;
  closeModal: () => void;
  teamCode: string;
}) => {
  const treeNodes = useTagTree({ teamCode });
  const [showFilterInfoModal, setShowFilterInfoModal] = useState(false);
  const [nodes, setNodes] = useState<TagNode[]>([]);

  const selectedTags = useAtomValue(tagSelectedAtom);
  const [partialSelectedTags, setPartialSelectedTags] = useAtom(
    tagPartialSelectedAtom
  );

  const [tagCodeArr, setTagCodeArr] = useAtom(tagCodeArrAtom);
  useEffect(() => {
    const flatSelectedTags = selectedTags.flat();
    setTagCodeArr(flatSelectedTags);
    //remove selected tags from partial selected tags
    setPartialSelectedTags((prevPartialSelectedTags) =>
      prevPartialSelectedTags.filter((tag) => !flatSelectedTags.includes(tag))
    );
  }, [selectedTags, setTagCodeArr]);
  const clearFilter = useSetAtom(tagResetAtom);

  //useEffect for initial load of treeNodes
  useEffect(() => {
    if (treeNodes.length) {
      //update treeNodes selected state
      treeNodes.forEach((node) => updateTreeNodes(node));
      setNodes(treeNodes);
    }
  }, [isOpen, treeNodes, tagCodeArr]);

  //function to update treeNodes selected state
  const updateTreeNodes = (node: TagNode): void => {
    //set selected state of node based on tagCodeArr and partialSelectedTags
    node.selected = tagCodeArr.includes(node.code)
      ? checkType.CHECKED
      : partialSelectedTags.includes(node.code)
      ? checkType.PARTIAL
      : checkType.UNCHECKED;

    if (node.children) {
      node.children.forEach((child) => updateTreeNodes(child));
    }
  };

  const renderTree = (node: TagNode) => {
    return <TagTree node={node} />;
  };

  return (
    <Modal
      isVisible={isOpen}
      style={{ margin: 0 }}
      propagateSwipe={true}
      backdropOpacity={0.3}
      swipeDirection={"down"}
      backdropColor={"#1E1F20"}
      onBackButtonPress={() => closeModal()}
      onBackdropPress={() => closeModal()}
      onSwipeComplete={() => closeModal()}
    >
      <View style={styles.modalView}>
        <View style={styles.dragView}>
          <Image
            source={require("../images/dragline.png")}
            style={styles.dragImage}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: getHeight(20),
            paddingHorizontal: getWidth(16),
          }}
        >
          <Text style={styles.modalTitleText}>Filter By Tags</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              accessibilityLabel="tagFilter"
              accessible
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginEnd: getWidth(16),
              }}
              onPress={() => {
                setShowFilterInfoModal(true);
              }}
            >
              <Image
                style={styles.resetFilterImage}
                source={require("../images/refresh.png")}
              />
              <Text style={styles.resetFiltersText}>Reset Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityLabel="doneFilter"
              accessible
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => {
                closeModal();
              }}
            >
              <Text style={styles.resetFiltersText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={{ paddingHorizontal: getWidth(16) }}>
          {nodes && nodes.map((node) => renderTree(node))}
        </ScrollView>
        {showFilterInfoModal && (
          <GenericInfoModal
            isVisible={showFilterInfoModal}
            heading={"Confirm Reset Filters"}
            simpleText={
              "You're about to reset all filters. Are you sure you want to proceed?"
            }
            successText={"Reset"}
            success={() => {
              clearFilter();
              setShowFilterInfoModal(false);
            }}
            close={() => {
              setShowFilterInfoModal(false);
            }}
          />
        )}
      </View>
    </Modal>
  );
};

export default connect((state: any) => ({
  enabledTagTrees: selectors.enabledTagsTree(state),
  tagTrees: state.persist.data.tagTrees2,
}))(FilterByTagsModal);

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 8,
  },
  modalView: {
    maxHeight: Layout.window.height - getStatusBarHeight(true) - getHeight(10),
    backgroundColor: "#FFFFFF",
    marginTop: "auto",
    borderTopLeftRadius: getWidth(10),
    borderTopRightRadius: getWidth(10),
    paddingBottom: getBottomSpace(),
  },
  modalTitleText: {
    fontFamily: fontFamily.SemiBold,
    fontSize: getHeight(16),
    color: "black",
  },
  resetFilterImage: {
    height: getHeight(12.8),
    width: getHeight(12.8),
    marginEnd: getWidth(2),
  },
  resetFiltersText: {
    fontFamily: fontFamily.Regular,
    fontSize: getHeight(14),
    color: "#08A88E",
  },
  listView: {
    flexDirection: "row",
    marginVertical: getHeight(16),
    marginHorizontal: getWidth(15),
    alignItems: "center",
  },
  listText: {
    fontSize: getHeight(14),
    fontWeight: "400",
    fontFamily: fontFamily.Medium,
    lineHeight: getHeight(20),
    color: "#000000",
    alignSelf: "center",
  },
  dragView: {
    display: "flex",
    alignItems: "center",
    marginBottom: getHeight(20),
  },
  dragImage: {
    width: getWidth(36),
    height: getHeight(5),
    marginTop: getHeight(5),
  },
  horizontalLine: {
    height: getHeight(1),
    backgroundColor: "#E5EDF0",
    marginVertical: getHeight(8),
  },
  container: {
    flex: 1,
    paddingVertical: 40,
  },
  wrapItem: {
    flexDirection: "row",
    //backgroundColor: "white",
    //marginVertical: 8,
    //backgroundColor: "green",
  },
  tagName: {
    fontSize: getHeight(14),
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    //height: getHeight(40),
  },
  iconItem: {
    backgroundColor: "green",
    //marginEnd: getWidth(12),
  },
});
