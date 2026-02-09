import React, { Component } from "react";
import {
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import "@react-native-firebase/database";
import "@react-native-firebase/auth";
import { connect } from "react-redux";
import { getHeight, getWidth } from "../services/helper";
import { sortTypes } from "../constants/strings";
import { fontFamily } from "../constants/strings";
import { getBottomSpace, getStatusBarHeight } from "../services/iphoneXHelper";

class SortModal extends Component {
  render() {
    const { isOpen, closeModal, sortType } = this.props;
    const sortMenuItems = [
      {
        isVisible: true,
        sortMode: sortTypes.NEWEST,
        title: "Newest",
        onPress: async () => {
          closeModal(sortTypes.NEWEST);
        },
      },
      {
        isVisible: true,
        sortMode: sortTypes.LAST_VIEWED,
        title: "Last Viewed",
        onPress: async () => {
          closeModal(sortTypes.LAST_VIEWED);
        },
      },
      {
        isVisible: true,
        sortMode: sortTypes.ALPHABETICAL,
        title: "Alphabetical",
        onPress: async () => {
          closeModal(sortTypes.ALPHABETICAL);
        },
      },
    ];

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
          <FlatList
            data={sortMenuItems}
            renderItem={({ item, index }) => {
              return item.isVisible ? (
                <View
                  key={index + ""}
                  style={[
                    { flex: 1 },
                    sortType === item.sortMode && {
                      backgroundColor: "#DFF5EF",
                    },
                  ]}
                >
                  <TouchableOpacity
                    accessible
                    accessibilityLabel={item.title.replaceAll(" ", "")}
                    style={styles.listView}
                    onPress={item.onPress}
                  >
                    <Text style={styles.listText}>{item.title}</Text>
                  </TouchableOpacity>
                </View>
              ) : null;
            }}
          />
        </View>
      </Modal>
    );
  }
}

export default connect((state) => ({
  drawer: state.general.drawer,
  heartFlowLink: state.persist.heartFlowLink,
}))(SortModal);

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: "#FFFFFF",
    marginTop: "auto",
    borderTopLeftRadius: getWidth(10),
    borderTopRightRadius: getWidth(10),
    paddingBottom: getBottomSpace(),
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
    marginBottom: getHeight(8),
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
});
