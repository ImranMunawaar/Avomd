import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import React, { Component } from "react";
import { StyleSheet, View, KeyboardAvoidingView, Alert } from "react-native";
// This is related to native base library. If we need that component we should import it from react native.
// import {
//   Container,
//   Content,
//   Card,
//   CardItem,
//   Text,
//   Button,
//   Form,
//   Item,
//   Label,
//   Input,
//   Grid,
//   Col,
//   Row,
//   Icon,
// } from "native-base";
import { connect } from "react-redux";
import { globalStyles } from "../components/GlobalStyles";
import { Section } from "../components/Section";
import { selectors } from "../store";
import { initModules } from "../models/modules";
import * as Analytics from "../services/Analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../constants/Colors";
import crashlytics from "@react-native-firebase/crashlytics";
import { getDatabaseInstance } from "../services/helper";

class SubscriptionScreen extends Component {
  state = {};
  defaultState = {
    channelName: "",
    channelInvitationCode: "",
  };

  UNSAFE_componentWillMount() {
    this.setState(this.defaultState);
  }

  async componentDidMount() {
    this.setState({ startTimestamp: new Date().getTime() });
    Analytics.track(Analytics.events.VIEW_SUBSCRIPTION_SCREEN);
    this.user = JSON.parse(await AsyncStorage.getItem("user"));
  }

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };

  subscribeToChannel = async (channelName, channelInvitationCode) => {
    const channelToSubscribe = this.props.allChannels[channelName];
    if (!channelToSubscribe) {
      const errorMsg = "Requested channel to be added does not exist";
      alert(errorMsg);

      Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL_ERROR, {
        "channel name": channelName,
        "invitation code": channelInvitationCode ? channelInvitationCode : null,
        "is private": channelToSubscribe
          ? channelToSubscribe.publicity === "private"
          : false,
        error: errorMsg,
      });

      this.setState(this.defaultState);
      return;
    }
    if (
      channelToSubscribe.publicity === "private" &&
      channelToSubscribe.invitationCode !== channelInvitationCode
    ) {
      const errorMsg =
        "Requested private channel does not have the correct code";
      alert(errorMsg);

      Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL_ERROR, {
        "channel name": channelName,
        "invitation code": channelInvitationCode ? channelInvitationCode : null,
        "is private": channelToSubscribe.publicity === "private",
        error: errorMsg,
      });

      this.setState(this.defaultState);
      return;
    }
    if (this.props.activeChannels.includes(channelName)) {
      const errorMsg = "Already subscribed to channel";
      alert(errorMsg);

      Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL_ERROR, {
        "channel name": channelName,
        "invitation code": channelInvitationCode ? channelInvitationCode : null,
        "is private": channelToSubscribe.publicity === "private",
        error: errorMsg,
      });

      this.setState(this.defaultState);
      return;
    }
    this.props.dispatch({
      type: "SET_CHANNELS",
      channelName: "activeChannels",
      data: [...this.props.activeChannels, channelName],
    });
    Analytics.track(Analytics.events.ADD_ACTIVE_CHANNEL, {
      "channel name": channelName,
      "is private": channelToSubscribe.publicity === "private",
      duration: this.duration(),
    });
    this.setState(this.defaultState);
    this.updateFirebaseWithChannels();
    initModules();

    Analytics.identify(this.user.email, {
      "active channels": this.props.activeChannels,
    });
  };

  updateFirebaseWithChannels = () => {
    if (!this.user.isByPassUser) {
      setTimeout(async () => {
        try {
          getDatabaseInstance()
            .ref(`users/${this.user.uid}/subscriptions`)
            .set(this.props.activeChannels);
        } catch (e) {
          crashlytics().recordError(e);
          console.log("Update firebase db error", e);
        }
      });
    }
  };

  removeChannel = async (channel) => {
    //console.log("REMOVE CHANNEL", channel);
    Analytics.track(Analytics.events.CLICK_REMOVE_CHANNEL, {
      "channel name": channel.code,
      "is private": channel.publicity === "private",
    });
    if (channel.code === "test") {
      await AsyncStorage.removeItem("test_channel_local");
    }
    this.props.dispatch({
      type: "SET_CHANNELS",
      channelName: "activeChannels",
      data: [
        ...this.props.activeChannels.filter(
          (currentChannel) => currentChannel !== channel.code
        ),
      ],
    });
    this.updateFirebaseWithChannels();
  };

  resetSubscriptions = () => {
    Alert.alert(
      "Reset subscriptions",
      "Are you sure you want to reset subscriptions?",
      [
        {
          text: "Yes",
          onPress: async () => {
            Analytics.identify(this.user.email, {
              "reset subscriptions": new Date().toString(),
            });
            Analytics.track(Analytics.events.CONFIRM_RESET_SUBSCRIPTIONS);

            const releaseConfigurations = require("../../releaseConfigurations.json");
            this.props.dispatch({
              type: "SET_RELEASE_TARGET",
              data: releaseConfigurations.activeReleaseTarget,
            });
            this.props.dispatch({
              type: "SET_CHANNELS",
              channelName: "activeChannels",
              data: releaseConfigurations.targets[
                releaseConfigurations.activeReleaseTarget
              ].defaultInitialChannels,
            });
          },
        },
        {
          text: "No",
          onPress: () => {
            Analytics.track(Analytics.events.CANCEL_RESET_SUBSCRIPTIONS);
          },
        },
      ]
    );
  };

  render() {
    const { navigation, myChannels, allChannels, activeChannels } = this.props;
    const { channelName, channelInvitationCode } = this.state;

    return ( null
      // <Container>
      //   <PageHeader
      //     onBackPress={() => {
      //       Analytics.track(Analytics.events.EXIT_SUBSCRIPTION_SCREEN, {
      //         duration: this.duration(),
      //       });
      //       navigation.goBack();
      //     }}
      //     title={"Subscribe to Channels"}
      //   />
      //   <Content>
      //     <Section title={"Your Enrollments"} />
      //     <Card style={styles.cardStyle}>
      //       {myChannels &&
      //         myChannels
      //           .filter((e) => e != null)
      //           .map((channel, key) => (
      //             <CardItem
      //               key={key}
      //               bordered
      //               style={globalStyles.cardHeaderStyle}
      //             >
      //               <Grid>
      //                 <Row>
      //                   <Col size={99}>
      //                     <Text style={{ fontSize: 13, fontWeight: "500" }}>
      //                       {channel.publicity === "private"
      //                         ? "Private"
      //                         : "Public"}
      //                     </Text>
      //                     <Text>{channel.channelTitle}</Text>
      //                   </Col>
      //                   <Col style={{ width: 48 }}>
      //                     <Button
      //                       light
      //                       icon
      //                       rounded
      //                       onPress={() => this.removeChannel(channel)}
      //                     >
      //                       <Icon name="trash" />
      //                     </Button>
      //                   </Col>
      //                 </Row>
      //                 <Row>
      //                   <Text style={{ color: "#EA8065", fontSize: 14 }}>
      //                     Team AvoMD et al
      //                   </Text>
      //                 </Row>
      //               </Grid>
      //             </CardItem>
      //           ))}
      //     </Card>
      //     <Section title={"Available Public Channels"} />
      //     {Object.keys(allChannels)
      //       .filter((e) => e != null)
      //       .filter(
      //         (channel) =>
      //           allChannels[channel] &&
      //           allChannels[channel].publicity === "public"
      //       )
      //       .map((channel) => (
      //         <Card key={channel} style={styles.cardStyle}>
      //           <CardItem
      //             button
      //             bordered
      //             style={globalStyles.cardHeaderStyle}
      //             onPress={() => {
      //               Analytics.track(
      //                 Analytics.events.CLICK_AVAIALABLE_PUBLIC_CHANNEL
      //               );
      //               this.subscribeToChannel(allChannels[channel].code);
      //             }}
      //           >
      //             <View style={{ flexDirection: "column" }}>
      //               <Text>{allChannels[channel].channelTitle}</Text>
      //               <Text style={{ color: "#EA8065", fontSize: 14 }}>
      //                 {activeChannels.includes(channel)
      //                   ? "Subscribed"
      //                   : "Tap to subscribe"}
      //               </Text>
      //             </View>
      //           </CardItem>
      //         </Card>
      //       ))}
      //     <Section title={"Private Channels"} />
      //     <Card style={styles.cardStyle}>
      //       <CardItem bordered style={globalStyles.cardHeaderStyle}>
      //         <Text>Not Authorized to Access the Private Channels</Text>
      //       </CardItem>
      //     </Card>
      //     <Button
      //       full
      //       style={{
      //         backgroundColor: "red",
      //         marginHorizontal: 20,
      //         borderRadius: 6,
      //       }}
      //       onPress={() => {
      //         Analytics.track(Analytics.events.CLICK_RESET_SUBSCRIPTIONS);
      //         this.resetSubscriptions();
      //       }}
      //     >
      //       <Text>Reset</Text>
      //     </Button>
      //   </Content>
      //   <KeyboardAvoidingView
      //     behavior="padding"
      //     enabled
      //     style={{
      //       margin: 0,
      //       backgroundColor: "white",
      //       bottom: 0,
      //       paddingHorizontal: 20,
      //       paddingVertical: 10,
      //       borderTopWidth: 0.5,
      //       flexDirection: "column",
      //     }}
      //   >
      //     <Form>
      //       <Item stackedLabel>
      //         <Label>Channel Name</Label>
      //         <Input
      //           onChangeText={(inputValue) =>
      //             this.setState({ channelName: inputValue.toLowerCase() })
      //           }
      //         />
      //       </Item>
      //       <Item stackedLabel>
      //         <Label>Invitation Code (Only For Private Channels)</Label>
      //         <Input
      //           onChangeText={(inputValue) =>
      //             this.setState({
      //               channelInvitationCode: inputValue.toLowerCase(),
      //             })
      //           }
      //           value={this.state.channelInvitationCode}
      //           autoCapitalize="none"
      //           secureTextEntry
      //         />
      //       </Item>
      //     </Form>
      //     <View style={{ height: 10 }} />
      //     <Button
      //       full
      //       style={{
      //         backgroundColor: Colors.infoBoxThemeColor,
      //         borderRadius: 6,
      //       }}
      //       onPress={() => {
      //         Analytics.track(Analytics.events.CLICK_SUBSCRIBE_BUTTON);
      //         this.subscribeToChannel(channelName, channelInvitationCode);
      //       }}
      //     >
      //       <Text style={{ color: "white" }}>Subscribe</Text>
      //     </Button>
      //     <View style={{ height: 20 }} />
      //   </KeyboardAvoidingView>
      // </Container>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
  },
});

export default connect((state) => ({
  myChannels: selectors.myChannels(state),
  activeChannels: state.persist.channels.activeChannels,
  allChannels: state.persist.channels.allChannels,
}))(SubscriptionScreen);
