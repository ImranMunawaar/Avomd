import React, { Component } from "react";
// import { Header } from "native-base";
import {
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { fontFamily } from "../../constants/strings";
import { getHeight, getWidth } from "../../services/helper";
import Modal from "react-native-modal";
import { getStatusBarHeight } from "../../services/iphoneXHelper";
import { trimLastExc } from "../../constants/replace";

export class DashboardSegmentedModal extends Component {
  constructor(props) {
    super(props, {
      scrollOffset: null,
    });
    this.state = {
      data: [],
      isSearchingText: false,
      error: null,
    };
    this.scrollViewRef = React.createRef();
    this.searchChoiceText = React.createRef();
    this.arrayholder = [];
  }
  componentDidMount() {
    this.setState({
      data: this.props.choiceItems,
    });
    this.arrayholder = this.props.choiceItems.map((item, index) => {
      return { ...item, itemIndex: index };
    });
  }

  searchFilterFunction = (text) => {
    // set border state if typed some thing
    if (text != "") {
      if (!this.state.isSearchingText) {
        this.setState({
          isSearchingText: true,
        });
      }
    } else {
      this.setState({
        isSearchingText: false,
      });
    }

    const newData = this.arrayholder.filter((item) => {
      const labelStr = typeof item === "object" ? item.label : item;
      const label = trimLastExc(labelStr || "");
      const itemData = `${label.toUpperCase()}`;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    this.setState({ data: newData });
  };

  handleOnScroll = (event) => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
  };
  handleScrollTo = (p) => {
    if (this.scrollViewRef.current) {
      this.scrollViewRef.current.scrollTo(p);
    }
  };

  render() {
    const {
      isVisible,
      close,
      setChoice,
      selectedChoiceVal,
      selectedChoiceIndex,
      choiceItems,
    } = this.props;
    const { scrollOffset, isSearchingText, data } = this.state;

    return (
      <Modal
        testID={"segmentedModal"}
        isVisible={isVisible}
        onSwipeComplete={close}
        swipeDirection={["down"]}
        scrollTo={this.handleScrollTo}
        scrollOffset={scrollOffset}
        scrollOffsetMax={400 - 300} // content height - ScrollView height
        propagateSwipe={true}
        style={styles.modal}
      >
        <View style={styles.scrollableModal}>
          <View style={styles.dragView}>
            <Image
              source={require("../../images/dragline.png")}
              style={styles.dragImage}
            />
          </View>
          <View style={styles.listHeader}>
            <View style={styles.searchInputContainer}>
              <Image source={{ uri: "searchicon" }} style={styles.searchIcon} />
              <TextInput
                ref={this.searchChoiceText}
                style={[
                  styles.searchInput,
                  {
                    borderColor: isSearchingText ? "#08A88E" : "#E5EDF0",
                  },
                ]}
                onChangeText={(text) => this.searchFilterFunction(text)}
                placeholder={"Search choice"}
                placeholderTextColor={"#C5D1D8"}
              />
              {isSearchingText ? (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ data: this.arrayholder });
                    this.searchChoiceText.current._root.clear();
                  }}
                  style={{ backgroundColor: "transparent" }}
                >
                  <Image
                    source={require("../../images/crossicon.png")}
                    style={styles.crossIcon}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <ScrollView style={styles.flatListOuterView}>
            <View style={{ height: getHeight(54 * data.length) }}>
              <FlatList
                data={data}
                renderItem={({ item, index }) => {
                  const labelStr = typeof item === "object" ? item.label : item;
                  const label = trimLastExc(labelStr || "");
                  const itemIndex = item?.itemIndex ? item?.itemIndex : index;
                  const coefficient =
                    typeof item === "object"
                      ? item.coefficient != ""
                        ? item.coefficient
                        : 0
                      : 0;
                  return (
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#d3d3d3",
                      }}
                      onPress={() => {
                        setChoice(itemIndex, label, coefficient);
                        close();
                      }}
                    >
                      <View style={styles.flatListInnerView}>
                        <Text
                          style={[
                            styles.flatListText,
                            {
                              color:
                                selectedChoiceVal === label &&
                                selectedChoiceIndex === index
                                  ? "#08A88E"
                                  : "#1E1F20",
                            },
                          ]}
                        >
                          {label}
                        </Text>
                        {selectedChoiceVal === label &&
                          selectedChoiceIndex === index && (
                            <Image
                              source={require("../../images/check-item.png")}
                              style={styles.checkIcon}
                            />
                          )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-start",
    marginHorizontal: 0,
    marginBottom: 0,
    marginTop: getStatusBarHeight(true),
    backgroundColor: "#FFFFFF",
  },
  scrollableModal: {
    //maxHeight: getHeight(1000),
  },
  searchInput: {
    borderRadius: getHeight(8),
    borderColor: "#E5EDF0",
    borderWidth: getWidth(1),
    width: getWidth(344),
    marginLeft: -getWidth(30),
    paddingLeft: getWidth(35),
    height: getHeight(40),
  },
  searchInputContainer: {
    flexDirection: "row",
  },
  searchContainer: {
    marginStart: 18,
    marginEnd: 18,
    flex: 1,
  },
  dragView: { display: "flex", alignItems: "center" },
  dragImage: {
    width: getWidth(36),
    height: getHeight(5),
    marginTop: getHeight(5),
  },
  listHeader: {
    shadowColor: "#EDEDED",
    shadowOpacity: 1,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowRadius: 5,
    borderBottomWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListOuterView: { backgroundColor: "#FFFFFF" },
  flatListInnerView: {
    backgroundColor: "#FFFFFF",
    height: getHeight(48),
    width: getWidth(376),
    // display: "flex",
    flexDirection: "row",
  },
  flatListText: {
    color: "#1E1F20",
    fontStyle: "normal",
    flexDirection: "row",
    paddingVertical: getHeight(12),
    paddingHorizontal: getWidth(20),
    fontWeight: "400",
    fontSize: getHeight(16),
    lineHeight: getHeight(24),
    fontFamily: fontFamily.Regular,
  },
  searchIcon: {
    height: getHeight(20),
    width: getWidth(19),
    marginTop: getHeight(10),
    marginStart: getWidth(16),
    resizeMode: "contain",
  },
  crossIcon: {
    width: getWidth(16),
    height: getHeight(16),
    resizeMode: "contain",
    right: getWidth(11),
    top: getHeight(11),
    position: "absolute",

    // marginEnd: getWidth(16),
  },
  checkIcon: {
    height: getHeight(16),
    width: getWidth(16),
    alignContent: "center",
    marginVertical: getHeight(15),
    justifyContent: "center",
    //marginTop: getHeight(3),
    position: "absolute",
    right: getWidth(16),
    resizeMode: "contain",
  },
});
