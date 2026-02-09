import React, { Component } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { fontFamily } from "../constants/strings";
import { getHeight, getWidth } from "../services/helper";
import Modal from "react-native-modal";

export function TypeListModal(props) {
  const { isVisible, close, typeName, setTypeName } = props;
  const typeList = [
    "Physician",
    "Nurse",
    "APP (NP/PA)",
    "Medical Student",
    "Hospital Admin",
    "Pharmacist",
    "Other",
  ];

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={close}
      swipeDirection={["down"]}
      propagateSwipe={true}
      style={styles.modal}
      onBackdropPress={close}
    >
      <View>
        <View style={styles.flatListOuterView}>
          <View style={styles.dragView}>
            <Image
              source={require("../images/dragline.png")}
              style={styles.dragImage}
            />
          </View>
          <FlatList
            data={typeList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  backgroundColor: "#d3d3d3",
                }}
                onPress={() => {
                  setTypeName(item);
                  close();
                }}
              >
                <View style={styles.flatListInnerView}>
                  <Text
                    accessible={true}
                    accessibilityLabel={item}
                    style={styles.flatListText}
                  >
                    {item}
                  </Text>
                  {typeName === item && (
                    <Image
                      source={require("../images/check-item.png")}
                      style={styles.checkBox}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: "rgba(30, 31, 32, 0.3)",
    zIndex: 999,
    justifyContent: "flex-end",
  },
  dragView: {
    display: "flex",
    alignItems: "center",
  },
  dragImage: {
    width: getWidth(36),
    height: getHeight(5),
    marginTop: getHeight(5),
  },
  flatListOuterView: {
    backgroundColor: "#FFFFFF",
    paddingBottom: getHeight(20),
  },
  flatListInnerView: {
    backgroundColor: "#FFFFFF",
    //  borderBottomColor: "#000000",
    //borderBottomWidth: 2,
    paddingVertical: getHeight(10),
    alignItems: "center",
    flexDirection: "row",
    //flex: 1,
  },
  flatListText: {
    color: "#1E1F20",
    fontStyle: "normal",
    fontWeight: "400",
    //textAlignVertical: "center",
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    fontFamily: fontFamily.Regular,
    marginHorizontal: getWidth(16),
  },
  checkBox: {
    height: getHeight(16),
    width: getWidth(16),
    marginTop: getHeight(3),
    position: "absolute",
    right: getWidth(16),
    resizeMode: "contain",
    // marginLeft: getWidth(20),
    // marginRight: getHeight(8),
    //alignSelf: "flex-end",
    // alignItems: "flex-end",
    // justifyContent: "flex-end",
  },
});
