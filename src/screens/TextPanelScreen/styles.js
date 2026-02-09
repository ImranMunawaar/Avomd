import { StyleSheet } from "react-native";
import { getHeight, getWidth } from "../../services/helper";
import { buildVariants, fontFamily } from "../../constants/strings";
import Layout from "../../constants/Layout";
import Env from "../../constants/Env";
import Colors from "../../constants/Colors";
import { getBottomSpace } from "../../services/iphoneXHelper";

export default styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: "white",
  },
  innerView: {
    flex: 1,
    paddingBottom: getBottomSpace(),
    paddingTop: getHeight(10),
  },
  fieldInput: {
    flex: 1,
    color: "#1E1F20",
    lineHeight: getHeight(20),
    fontSize: getHeight(14),
    fontFamily: fontFamily.Regular,
    padding: getHeight(15),
  },
  sendButtonImage: {
    width: getHeight(20),
    height: getHeight(20),
    marginEnd: getWidth(15),
    marginTop: getHeight(10),
  },
  expandButtonImage: { width: getHeight(12), height: getHeight(12) },
});
