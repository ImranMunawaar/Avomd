import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { fontFamily } from "../constants/strings";
import { getHeight, getWidth } from "../services/helper";
import Modal from "react-native-modal";

export default function GenericInfoModal(props: {
  isVisible: boolean;
  heading: string;
  simpleText: string;
  successText: string;
  success: () => void;
  close: () => void;
}) {
  const { isVisible, heading, simpleText, successText, success, close } = props;
  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={close}
      swipeDirection={["down"]}
      propagateSwipe={true}
      style={styles.modal}
      onBackdropPress={close}
    >
      <View style={styles.mainView}>
        <Text style={styles.headingStyle}>{heading}</Text>
        <Text style={styles.simpleText}>{simpleText}</Text>
        <View>
          <TouchableOpacity
            onPress={() => success()}
            style={styles.successButtonStyle}
          >
            <Text style={styles.successText}>{successText}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => close()}
          style={styles.cancelButtonStyle}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    backgroundColor: "rgba(30, 31, 32, 0.3)",
    zIndex: 999,
    justifyContent: "center",
  },
  mainView: {
    backgroundColor: "#FFFFFF",
    paddingBottom: getHeight(20),
    marginHorizontal: getWidth(37),
    borderRadius: getHeight(30),
    justifyContent: "center",
    flexDirection: "column",
  },
  headingStyle: {
    color: "#000000",
    fontWeight: "600",
    lineHeight: getHeight(28),
    fontSize: getHeight(18),
    marginHorizontal: getWidth(55),
    marginTop: getHeight(35),
    textAlign: "center",
    fontFamily: fontFamily.Bold,
  },
  simpleText: {
    fontWeight: "400",
    color: "#1E1F20",
    marginTop: getHeight(16),
    marginHorizontal: getWidth(39),
    textAlign: "center",
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    fontFamily: fontFamily.Regular,
  },
  successButtonStyle: {
    marginTop: getHeight(20),
    backgroundColor: "#2E3438",
    width: getWidth(224),
    height: getHeight(50),
    borderRadius: getHeight(100),
    textAlign: "center",
    alignSelf: "center",
  },
  successText: {
    color: "#ffffff",
    textAlign: "center",
    marginVertical: getHeight(14),
    fontFamily: fontFamily.Regular,
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: getHeight(20),
    letterSpacing: 0.25,
  },
  cancelButtonStyle: {
    backgroundColor: "#ffffff",
  },
  cancelButtonText: {
    color: "#1E1F20",
    textAlign: "center",
    marginVertical: getHeight(15),
    fontWeight: "600",
    fontSize: getHeight(14),
    lineHeight: getHeight(20),
    fontFamily: fontFamily.Bold,
  },
  passwordField: {
    width: getWidth(224),
    height: getHeight(50),
    borderRadius: getHeight(100),
    borderWidth: 1,
    borderColor: "#566267",
    marginVertical: getHeight(19),
    textAlign: "center",
    alignSelf: "center",
  },
});
