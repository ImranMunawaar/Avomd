import React, { Component } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Text
} from "react-native";
import * as Linking from "expo-linking";
import Modal from "react-native-modal";
import { getReference, isValid } from "../models/modules";
import { globalStyles } from "../components/GlobalStyles";
import { Section } from "../components/Section";
import Media from "../components/Media";
import { InfoModal } from "./InfoModal";
import * as Analytics from "../services/Analytics";
import DraftJsView from "../components/DraftJsView";
import { getHeight, getWidth, isAndroid } from "../services/helper";
import Colors from "../constants/Colors";
import Clipboard from "@react-native-community/clipboard";
import _ from "lodash";
import { ReferenceModal } from "./ReferenceModal";
import { fontFamily } from "../constants/strings";
import { getBottomSpace, getStatusBarHeight } from "../services/iphoneXHelper";
import { updateDraftJsForMentions } from "../services/helper";

export class InformationModal extends Component {
  state = {
    visibleModalId: null,
    remoteImageHeight: 400,
    remoteImageWidth: 400,
    remoteImageAspectRatio: 1,
    clipBoardText: "Copy to Clipboard",
  };

  handleOnScroll = (event) => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
  };

  handleScrollTo = (p) => {
    if (this.scrollViewRef) {
      this.scrollViewRef.scrollTo(p);
    }
  };

  // copy to clipboard for note generated
  onPressClipBoard = (info) => {
    const {
      getVar,
      isCalc,
      variables,
    } = this.props;
    const isNewJSON = _.has(info, "newTextJson");
    const dataJSON = isNewJSON ? info.newTextJson : info.textJson;
    const parsedJSON = JSON.parse(dataJSON);
    const data = updateDraftJsForMentions(
      parsedJSON,
      variables,
      getVar,
      isNewJSON,
      isCalc
    );
    let dataForClipboard = "";
    data?.blocks?.forEach((element) => {
      dataForClipboard += element?.text + "\n";
    });
    Clipboard.setString(dataForClipboard);
    this.setState({ clipBoardText: "copied!" });
    setTimeout(() => {
      this.setState({ clipBoardText: "Copy to Clipboard" });
    }, 2000);
  };
  render() {
    const {
      info,
      onClose,
      isInfoAvailable,
      protocol,
      getVar,
      isCalc,
      setReference,
      setInfo,
      variables,
      conditionalObjects
    } = this.props;
    let { reference } = this.state;
    const isNewTextJson = _.has(info, "newTextJson");
    const win = Dimensions.get("window");
    if (!info) {
      return <View />;
    }

    const references = !isValid(info.calloutReferences)
      ? []
      : info.calloutReferences
          .filter((reference) => true)
          .map((reference) => {
            if (reference instanceof String || !isNaN(reference)) {
              return getReference(reference);
            } else {
              return reference;
            }
          });

    var toolLink = null;
    if (isValid(info.toolLink)) {
      toolLink = info.toolLink;
    }

    // check is the text include: **

    var hasBullet = null;
    var text = "";
    if (info.calloutText.includes("**")) {
      hasBullet = true;
    } else {
      hasBullet = false;
    }

    const toolLinks = isValid(info.toolLink) && info.toolLink.split(" | ");
    const toolNames = isValid(info.toolName) && info.toolName.split(" | ");
    return (
      <Modal
        style={{
          margin: 0,
          paddingLeft: 0,
          paddingRight: 0,
          backgroundColor: "white",
        }}
        isVisible={isInfoAvailable}
        onBackButtonPress={onClose}
      >
        <View
          style={{
            flex:1,
            marginTop: getStatusBarHeight(true),
            borderRadius: getHeight(8),
            backgroundColor: "white",
            paddingBottom:getBottomSpace()
          }}
        >
          {/*<View>*/}
          <ScrollView
            style={{ flex: 1 }}
            ref={(ref) => (this.scrollViewRef = ref)}
            onScroll={this.handleOnScroll}
          >
            <View style={styles.cardStyle}>
              <TouchableOpacity
                hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
                style={{
                  paddingTop: getHeight(12),
                  alignSelf: "flex-end",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
                onPress={onClose}
              >
                <Image
                  source={require("../images/close-thick.png")}
                  style={{
                    width: getHeight(15),
                    height: getHeight(15),
                  }}
                />
              </TouchableOpacity>
              <View
                style={{
                  paddingBottom: getHeight(20),
                  //paddingEnd: getWidth(24),
                }}
              >
                <Text
                  style={{
                    fontSize: getHeight(32),
                    fontWeight: "500",
                    color: "#000000",
                    fontFamily: fontFamily.Regular,
                    marginBottom: getHeight(5),
                    lineHeight: getHeight(35),
                    marginEnd: getWidth(20),
                  }}
                >
                  {info.title}
                </Text>
                {Boolean(info.subtitle) && (
                  <Text
                    style={{
                      fontSize: getHeight(16),
                      color: "#A0A0A0",
                      fontFamily: fontFamily.Regular,
                      marginBottom: getHeight(5),
                    }}
                  >
                    {info.subtitle}
                  </Text>
                )}

                <View style={{ marginBottom: getHeight(10) }}>
                  <Media info={info} extraSpace={getWidth(76)} />
                </View>
                {isValid(info.textJson) ||
                (isValid(info.newTextJson) && !info?.isFormula) ? (
                  <View style={{ marginBottom: getHeight(10) }}>
                    <DraftJsView
                      blocksJSON={
                        isNewTextJson ? info.newTextJson : info.textJson
                      }
                      getVar={getVar}
                      setInfo={setInfo}
                      isNewJson={isNewTextJson}
                      isCalc={isCalc}
                      variables={variables}
                      setReference={(reference) => this.setState({ reference })}
                      conditionalObjects={conditionalObjects}
                    />
                  </View>
                ) : (
                  <>
                    <View style={{ marginTop: getWidth(10) }}>
                      {info.calloutText.split("|").map((sentence, key) => {
                        var singleLine = sentence;
                        var theLineHasBullet = false;

                        if (singleLine.includes("**")) {
                          singleLine = singleLine.replace("**", "");
                          theLineHasBullet = true;
                        }

                        return (
                          <View key={key} style={{ flexDirection: "row" }}>
                            <Text style={{ marginEnd: getWidth(10.85) }}>
                              {!hasBullet && (
                                <Text style={styles.bulletStyle}>
                                  {isAndroid ? "\u2022" : "\u25CF"}
                                </Text>
                              )}
                              {hasBullet && theLineHasBullet && (
                                <Text style={styles.bulletStyle}>
                                  {isAndroid ? "\u2022" : "\u25CF"}
                                </Text>
                              )}
                            </Text>
                            <Text>
                              {sentence.split("::").length <= 1
                                ? [
                                    theLineHasBullet || !hasBullet ? (
                                      <Text style={styles.paragraphStyle}>
                                        {singleLine}
                                      </Text>
                                    ) : (
                                      <Text style={styles.paragraphStyle}>
                                        {singleLine}
                                      </Text>
                                    ),
                                  ]
                                : [
                                    <Text
                                      key={`${key}-1`}
                                      style={{
                                        fontWeight: "700",
                                        fontSize: getHeight(16),
                                        lineHeight: getHeight(21.6),
                                        fontFamily: fontFamily.Regular,
                                      }}
                                    >
                                      {singleLine.split("::")[0]}:
                                    </Text>,
                                    <Text
                                      key={`${key}-2`}
                                      style={styles.paragraphStyle}
                                    >
                                      {singleLine.split("::")[1]}
                                    </Text>,
                                  ]}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    {info?.isFormula && (
                      <View style={{ marginBottom: getHeight(10) }}>
                        <DraftJsView
                          blocksJSON={
                            isNewTextJson ? info.newTextJson : info.textJson
                          }
                          getVar={getVar}
                          isNewJson={isNewTextJson}
                          isCalc={isCalc}
                          setInfo={setInfo}
                          variables={variables}
                          setReference={(reference) =>
                            this.setState({ reference })
                          }
                          conditionalObjects={conditionalObjects}
                        />
                      </View>
                    )}
                  </>
                )}

                {isValid(info.introduction) && !isValid(info.newTextJson) && (
                  <View style={globalStyles.singleCardItem} bordered>
                    {info.introduction.split("|").map((sentence, key) => {
                      return (
                        <Text
                          key={key}
                          style={{ fontSize: 15, marginTop: 8, lineHeight: 26 }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              lineHeight: 26,
                            }}
                          >
                            -︎{" "}
                          </Text>
                          {sentence.split("::").length <= 1
                            ? sentence
                            : [
                                <Text
                                  key={`${key}-1`}
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: 15,
                                    lineHeight: 26,
                                  }}
                                >
                                  {sentence.split("::")[0]}:
                                </Text>,
                                <Text
                                  key={`${key}-2`}
                                  style={styles.paragraphStyle}
                                >
                                  {sentence.split("::")[1]}
                                </Text>,
                              ]}
                        </Text>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {info.type === "NOTE" && (
              <TouchableOpacity
                onPress={() => {
                  this.onPressClipBoard(info);
                }}
                style={styles.clipBoardButton}
              >
                <Text style={styles.clipBoardText}>
                  {this.state.clipBoardText}
                </Text>
              </TouchableOpacity>
            )}

            {isValid(toolLink) && (
              <View>
                <Section title={"Additional Resources"} />
                <View style={styles.cardStyle}>
                  {toolLinks.map((toolLink, index) => {
                    return (
                      <TouchableOpacity
                        style={[
                          globalStyles.firstCardItemStyle,
                          { marginRight: 0, marginLeft: 0 },
                        ]}
                        button
                        onPress={() => {
                          Linking.openURL(toolLink);
                        }}
                      >
                        <View style={styles.toolNames} >
                          <Text style={globalStyles.readableButtonTextStyle}>
                            {toolNames[index]}
                          </Text>
                          <View
                            style={{
                              marginLeft: getWidth(7),
                              width: getWidth(15),
                              justifyContent: "center",
                            }}
                          >
                            <Image
                              source={require("../images/chevron-small-right.png")}
                              style={{
                                height: getHeight(20),
                                width: getHeight(20),
                              }}
                            />
                          </View>
                        </View>
                        <View style={{ height: getHeight(7) }} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {references.length > 0 && (
              <View style={styles.WrapperStyle}>
                <Text style={styles.headingStyle}>{"References"}</Text>
                <View>
                  {references.map((reference, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        Analytics.track(Analytics.events.CLICK_REFERENCE_LINK, {
                          reference: isValid(reference) && reference.source,
                          protocol: protocol.code,
                        });
                        Linking.openURL(reference.url);
                      }}
                    >
                      {isValid(reference) && (
                        <Text style={globalStyles.readableButtonTextStyle}>
                          {i + 1}. {reference.source}
                        </Text>
                      )}
                      {/* <View style={{marginLeft: 7, width: 15, justifyContent: "center"}}>
                            <Icon type={"Ionicons"} style={{color: "gray"}} name="ios-chevron-forward"/>
                          </View> */}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          {/*</View>*/}
          <ReferenceModal
            reference={reference}
            onClose={() => {
              Analytics.track(Analytics.events.CLOSE_REFERENCE_MODAL);
              this.setState({ reference: null });
            }}
            onModalClose={() => this.setState({ reference: null })}
          />
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginStart: getWidth(14),
    marginEnd: getWidth(14),
    marginVertical: getHeight(14),
    borderRadius: getHeight(30),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    backgroundColor: "#ffffff",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    paddingBottom: getHeight(15),
    paddingEnd: getWidth(24),
    paddingStart: getWidth(24),
    paddingTop: getHeight(15),
  },
  paragraphStyle: {
    flex: 1,
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(21.6),
    color: "#515151",
    fontWeight: "400",
  },
  WrapperStyle: {
    marginVertical: getHeight(18.31),
    marginHorizontal: getWidth(38),
  },
  headingStyle: {
    color: "#000000",
    fontSize: getHeight(24),
    lineHeight: getHeight(32.21),
    fontFamily: fontFamily.Regular,
    fontWeight: "400",
    marginBottom: getHeight(6),
  },
  bulletStyle: {
    fontSize: getHeight(9),
    fontFamily: fontFamily.Regular,
    lineHeight: getHeight(21.6),
    color: "#000000",
    marginEnd: getHeight(10.85),
  },
  clipBoardButton: {
    borderRadius: getHeight(50),
    width: getWidth(184),
    height: getHeight(48),
    alignSelf: "flex-start",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowRadius: 4,
    marginBottom: getHeight(5),
    marginStart: getWidth(23),
    backgroundColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
  },
  clipBoardText: {
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    color: "white",
    fontSize: getHeight(15),
  },
  toolNames:{
    flexDirection:"row",
    justifyContent:"space-between"
  }
});
