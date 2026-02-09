import React, { Component } from "react";
// import { Header } from "native-base";
import {
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  TextInput,
} from "react-native";
import { fontFamily } from "../constants/strings";
import { institutions } from "../constants/institutionList";
import { getHeight, getWidth } from "../services/helper";
import Modal from "react-native-modal";
import { getStatusBarHeight } from "../services/iphoneXHelper";

export class InstitutionListModal extends Component {
  constructor(props) {
    super(props, {
      scrollOffset: null,
    });
    this.state = {
      loading: false,
      data: [],
      selfText: "",
      isSearchingText: false,
      error: null,
    };
    this.scrollViewRef = React.createRef();
    this.searchInstitueText = React.createRef();
    this.arrayholder = [];
  }
  componentDidMount() {
    this.getInstitutionList();
  }
  getInstitutionList = () => {
    this.setState({ loading: true });

    this.setState({
      data: institutions,
      loading: false,
    });
    this.arrayholder = institutions;
  };

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
      const itemData = `${item.toUpperCase()}`;
      const textData = text.toUpperCase();

      return itemData.indexOf(textData) > -1;
    });
    if (newData.length === 0) {
      this.setState({
        data: newData,
        selfText: text.toUpperCase(),
      });
    } else {
      this.setState({
        data: newData,
        selfText: "",
      });
    }
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
    const { isVisible, close, institutionName } = this.props;
    const { loading, scrollOffset, isSearchingText, data, selfText } =
      this.state;
    if (loading && isVisible) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <Modal
        testID={"modal"}
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
              source={require("../images/dragline.png")}
              style={styles.dragImage}
            />
          </View>
          <View style={styles.listHeader}>
            <View style={styles.searchInputContainer}>
              <Image source={{ uri: "searchicon" }} style={styles.searchIcon} />
              <TextInput
                ref={this.searchInstitueText}
                style={[
                  styles.searchInput,
                  {
                    borderColor: isSearchingText ? "#08A88E" : "#E5EDF0",
                  },
                ]}
                onChangeText={(text) => this.searchFilterFunction(text)}
                placeholder={"Search institution"}
                placeholderTextColor={"#C5D1D8"}
              />
              {isSearchingText ? (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ data: this.arrayholder, selfText: "" });
                    this.searchInstitueText.current._root.clear();
                  }}
                  style={{ backgroundColor: "transparent" }}
                >
                  <Image
                    source={require("../images/crossicon.png")}
                    style={styles.crossIcon}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <View style={styles.flatListOuterView}>
            <FlatList
              data={data}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#d3d3d3",
                  }}
                  onPress={() => {
                    institutionName(item);
                    close();
                  }}
                >
                  <View style={styles.flatListInnerView}>
                    <Text style={styles.flatListText}>{item}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            {data.length == 0 && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#d3d3d3",
                }}
                onPress={() => {
                  institutionName(selfText);
                  close();
                }}
              >
                <View style={styles.flatListInnerView}>
                  <Text style={styles.flatListText}>{`${selfText}`}</Text>
                  <View style={styles.selectButtonContainer}>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => {
                        institutionName(selfText);
                        close();
                        Keyboard.dismiss;
                      }}
                    >
                      <Text style={styles.selectText}>Select</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
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
    //height: getHeight(1000),
  },
  scrollableModal: {
    //maxHeight: getHeight(1000),
  },
  searchInput: {
    //backgroundColor: "#ffffff",
    borderRadius: getHeight(8),
    borderColor: "#E5EDF0",
    borderWidth: getWidth(1),
    width: getWidth(344),
    marginLeft: -getWidth(30),
    //marginRight: -getWidth(10),
    paddingLeft: getWidth(35),
    height: getHeight(40),
    // paddingHorizontal: getWidth(10),
    // paddingVertical: getHeight(20),
  },
  searchInputContainer: {
    // marginTop: -getHeight(5),
    flexDirection: "row",
    // flex: 1,
    // alignItems: "center",
    // flexDirection: "row",
    // height: 39,
    // marginHorizontal: getWidth(16),
    //marginVertical: getHeight(12),
  },
  searchContainer: {
    marginStart: 18,
    marginEnd: 18,
    //borderRadius: 53 / 2,
    // elevation: 4,
    // shadowColor: "#000000",
    // shadowOpacity: 0.15,
    // shadowOffset: {
    //   height: 4,
    //   width: 0,
    // },
    //shadowRadius: 4,
    // backgroundColor: "white",
    flex: 1,
  },
  loader: {
    //flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -getHeight(25),
    //height: getHeight(400),
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
    display: "flex",
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
  selectButtonContainer: {
    flex: 2,
    marginTop: getHeight(8),
  },
  selectButton: {
    marginRight: getWidth(16),
    alignSelf: "flex-end",
    borderRadius: 16,
    backgroundColor: "#F2FAF7",
    width: getWidth(66),
    height: getHeight(32),
  },
  selectText: {
    paddingHorizontal: getWidth(12),
    paddingVertical: getHeight(6),
    fontSize: getHeight(14),
    color: "#08A88E",
    fontWeight: "400",
    lineHeight: getHeight(20),
  },
});
