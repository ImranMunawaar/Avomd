import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import _ from "lodash";
import { Component } from "react";
import { connect } from "react-redux";
import { atom, useAtom } from "jotai";
import Modal from "react-native-modal";
import { selectors } from "../store";
import { fontFamily } from "../constants/strings";
import { getHeight, getWidth, isAndroid } from "../services/helper";
import { getBottomSpace, getStatusBarHeight } from "../services/iphoneXHelper";
import Layout from "../constants/Layout";

//export const selectedChannelAtom = atom<string | undefined>(undefined);
export const selectedChannelAtom = atom(undefined);

function SubscribeChannelModal(props) {
  const [selectedChannel, setSelectedChannel] = useAtom(selectedChannelAtom);
  const setChannel = (code) => {
    setSelectedChannel(code);
    props.close();
  };

  const addChannel = () => {
    const { close, navigation } = props;
    close();
    navigation.navigate("Subscription", {});
  };

  const { myChannels, isOpenChannelModal, close } = props;
  let subscribedChannels = _.sortBy(
    myChannels,
    (myChannel) =>
      myChannel &&
      myChannel.channelTitle &&
      myChannel.channelTitle.toUpperCase()
  ).filter((e) => e != null);
  return (
    <Modal
      style={{ margin: 0, matginTop: getStatusBarHeight(true) }}
      propagateSwipe={true}
      backdropOpacity={0.3}
      swipeDirection={"down"}
      backdropColor={"#1E1F20"}
      isVisible={isOpenChannelModal}
      onBackButtonPress={() => close()}
      onBackdropPress={() => close()}
      onSwipeComplete={() => close()}
    >
      <View style={styles.modalView}>
        <View style={styles.dragView}>
          <Image
            source={require("../images/dragline.png")}
            style={styles.dragImage}
          />
        </View>
        <TouchableOpacity style={styles.addChannelView} onPress={addChannel}>
          <Image
            source={require("../images/add-channel.png")}
            style={styles.addChannelIcon}
          />
          <Text style={styles.addChannelText}>Add Channel</Text>
        </TouchableOpacity>
        <View style={styles.horizontalLine} />
        <ScrollView style={{ flexGrow: 0 }}>
          <TouchableOpacity onPress={() => setChannel(null)}>
            <View style={styles.channelListView}>
              <ImageBackground
                source={require("../images/all-channel-logo.png")}
                style={{
                  height: getHeight(40),
                  width: getHeight(40),
                }}
              >
                {!selectedChannel && (
                  <View style={styles.selectedChannelView}>
                    <Image
                      source={require("../images/check.png")}
                      style={styles.checkIcon}
                    />
                  </View>
                )}
              </ImageBackground>
              <Text
                style={{
                  ...styles.channelListText,
                  marginRight: getWidth(0),
                }}
              >
                All
              </Text>
              <Text
                style={{
                  ...styles.channelListText,
                  fontWeight: "400",
                  color: "#566267",
                  fontSize: getHeight(12),
                  paddingStart: getWidth(6),
                  fontStyle: "normal",
                }}
              >
                {`${subscribedChannels.length} Channels`}
              </Text>
            </View>
          </TouchableOpacity>
          {subscribedChannels.map((channel, index) => {
            return (
              <TouchableOpacity onPress={() => setChannel(channel.code)}>
                <View
                  style={[
                    styles.channelListView,
                    index === subscribedChannels.length - 1
                      ? { marginBottom: isAndroid ? getHeight(17) : 0 }
                      : {},
                  ]}
                >
                  <ImageBackground
                    source={
                      channel.icon
                        ? { uri: channel.icon }
                        : require("../images/avologo-icon.png")
                    }
                    style={{
                      height: getHeight(40),
                      width: getHeight(40),
                    }}
                    imageStyle={styles.channelIcon}
                  >
                    {channel.code === selectedChannel && (
                      <View style={styles.selectedChannelView}>
                        <Image
                          source={require("../images/check.png")}
                          style={styles.checkIcon}
                        />
                      </View>
                    )}
                  </ImageBackground>
                  <Text style={styles.channelListText}>
                    {channel.channelTitle}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default connect((state) => ({
  myChannels: selectors.myChannels(state),
}))(SubscribeChannelModal);

const styles = StyleSheet.create({
  modalView: {
    maxHeight: Layout.window.height - getStatusBarHeight(true) - getHeight(10),
    backgroundColor: "#FFFFFF",
    marginTop: "auto",
    borderTopLeftRadius: getWidth(10),
    borderTopRightRadius: getWidth(10),
    paddingBottom: getBottomSpace(),
  },
  channelListView: {
    flexDirection: "row",
    marginBottom: getHeight(16),
    marginHorizontal: getWidth(16),
  },
  channelListText: {
    fontWeight: "400",
    fontSize: getHeight(16),
    lineHeight: getHeight(24),
    paddingStart: getWidth(8),
    alignSelf: "center",
    color: "#1E1F20",
    fontFamily: fontFamily.Medium,
    marginRight: getWidth(40),
  },
  addChannelView: {
    paddingHorizontal: getWidth(16),
    flexDirection: "row",
  },
  addChannelText: {
    fontWeight: "600",
    fontSize: getHeight(16),
    lineHeight: getHeight(20),
    paddingStart: getWidth(8),
    color: "#000000",
    fontFamily: fontFamily.SemiBold,
    alignSelf: "center",
  },
  addChannelIcon: {
    width: getHeight(40),
    height: getHeight(40),
  },
  dragView: {
    display: "flex",
    alignItems: "center",
  },
  dragImage: {
    width: getWidth(36),
    height: getHeight(5),
    marginTop: getHeight(5),
    marginBottom: getHeight(17),
  },
  selectedChannelView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#23C29DCC",
    borderRadius: getHeight(8),
    borderColor: "#E5EDF0",
    borderWidth: 1,
  },
  channelIcon: {
    borderRadius: getHeight(8),
    borderWidth: 1,
    borderColor: "#E5EDF0",
  },
  checkIcon: {
    width: getHeight(25),
    height: getHeight(15),
  },

  horizontalLine: {
    height: 1,
    backgroundColor: "#E5EDF0",
    marginVertical: getHeight(7),
  },
});
