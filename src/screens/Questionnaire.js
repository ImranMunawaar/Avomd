import React, { Component } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Pressable,
  Text
} from "react-native";
import SearchableDropdown from "react-native-searchable-dropdown";
import { specialties, userTypes, occupations } from "../constants/userInfo";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/database";
import * as Analytics from "../services/Analytics";
import DropDownPicker from "react-native-dropdown-picker";
import Colors from "../constants/Colors";
import { buildVariants, fontFamily } from "../constants/strings";
import Env from "../constants/Env";
import _ from "lodash";
import { getDatabaseInstance, getHeight, getWidth } from "../services/helper";
import crashlytics from "@react-native-firebase/crashlytics";

export class Questionnaire extends Component {
  constructor(props) {
    super(props);
    this.defaultState = {
      specialties: [],
      conditional: null,
      userType: [],
      pickerOpen: false,
      specilityOpen: false,
      openOccupation: false,
      occupation: null,
      occupations: occupations,
    };
    this.randomUserType = `Role (ex: ${
      userTypes[Math.floor(Math.random() * userTypes.length)].label
    })`;
    this.randomSpecialty = `Skill (ex: ${
      specialties[Math.floor(Math.random() * specialties.length)].label
    })`;
    this.randomOccupation = `Occupation (ex: ${
      occupations[Math.floor(Math.random() * occupations.length)].label
    })`;
    this.state = { ...this.defaultState };
  }

  async componentDidMount() {
    this.user = firebase.auth().currentUser;
    this.setState({ startTimestamp: new Date().getTime() });
    Analytics.track(Analytics.events.VIEW_ADDITIONAL_INFO_SCREEN);
  }

  componentWillUnmount() {}

  duration = () => {
    const currTime = new Date().getTime();
    return parseInt(currTime - this.state.startTimestamp);
  };

  getValue = () => {
    return this.state.jobType;
  };

  focusedInput = (ref) => {
    this[ref].setNativeProps({
      style: {
        backgroundColor: "#E5F7EC",
        borderWidth: 1,
        borderColor: Colors.borderColor,
      },
    });
  };

  blurredInput = (ref) => {
    this[ref].setNativeProps({
      style: {
        backgroundColor: Colors.secondaryColor,
        borderWidth: 0,
        borderColor: "transparent",
      },
    });
  };

  validateContinue = () => {
    let { occupation } = this.state;
    if (Env.BUILD_VARIANT === buildVariants.COLUMBIA) {
      if (occupation) {
        let selectedOccupation = _.filter(occupations, { id: occupation });
        try {
          getDatabaseInstance()
            .ref(`users/${this.user.uid}/occupation`)
            .set(
              selectedOccupation.map((occupationItem) => {
                if (occupationItem.label === "Other") {
                  return "Other: " + this.state.conditionalOccupation.trim();
                } else {
                  return occupationItem.label;
                }
              })
            );

          Analytics.identify(this.user.email, {
            occupation: selectedOccupation.map((occupationItem) => {
              if (occupationItem.label === "Other") {
                return "Other: " + this.state.conditionalOccupation.trim();
              } else {
                return occupationItem.label;
              }
            }),
          });
          Analytics.track(Analytics.events.SET_ADDITIONAL_INFO, {
            duration: this.duration(),
          });
        } catch (e) {
          crashlytics().recordError(e);
          console.log("Error", e);
          return;
        }
        this.props.navigation.navigate("Modules");
      } else return;
    } else {
      let selectedSpecialities = [];
      _.forEach(this.state.specialties, function (value) {
        selectedSpecialities.push(_.filter(specialties, { id: value }));
      });
      let selectedUsers = [];
      _.forEach(this.state.userType, function (value) {
        selectedUsers.push(_.filter(userTypes, { id: value }));
      });
      selectedSpecialities = _.flattenDepth(selectedSpecialities, 1);
      selectedUsers = _.flattenDepth(selectedUsers, 1);
      const isOther =
        this.state.userType.length === 1 && selectedSpecialities === "Other";
      if (
        (this.state.specialties.length && this.state.userType.length) ||
        isOther
      ) {
        try {
          getDatabaseInstance()
            .ref(`users/${this.user.uid}/specialties`)
            .set(selectedSpecialities.map((specialty) => specialty.label));
          getDatabaseInstance()
            .ref(`users/${this.user.uid}/userTypes`)
            .set(
              selectedUsers.map((type) => {
                if (type.label === "Other") {
                  return "Other: " + this.state.conditional.trim();
                } else {
                  return type.label;
                }
              })
            );

          Analytics.identify(this.user.email, {
            "user types": selectedSpecialities.map(
              (specialty) => specialty.label
            ),
            specialties: selectedUsers.map((type) => {
              if (type.label === "Other") {
                return "Other: " + this.state.conditional.trim();
              } else {
                return type.label;
              }
            }),
          });
          Analytics.track(Analytics.events.SET_ADDITIONAL_INFO, {
            duration: this.duration(),
          });
        } catch (e) {
          crashlytics().recordError(e);
          console.log("Error", e);
          return;
        }
        this.props.navigation.navigate("Modules");
      } else return;
    }
  };

  setPickerOpen(isOpen) {
    this.setState({ pickerOpen: isOpen });
  }

  setPickerSpecilityOpen(isOpen) {
    this.setState({ specilityOpen: isOpen });
  }

  setOpenOccupation = (open) => {
    this.setState({
      openOccupation: open,
    });
  };

  setOccupation = (callback) => {
    this.setState((state) => ({
      occupation: callback(state.occupation),
    }));
  };

  setValue = (callback) => {
    this.setState((state) => ({
      userType: callback(state.userType),
    }));
    this.setPickerOpen(false);
  };

  setSpecialtyValue = (callback) => {
    this.setState((state) => ({
      specialties: callback(state.specialties),
    }));
    this.setPickerSpecilityOpen(false);
  };
  render() {
    const { openOccupation, occupation, occupations } = this.state;

    const showConditionalOther = this.state.userType
      .map((ut) => ut.label)
      .includes("Other");
    const isOther =
      this.state.userType.length === 1 &&
      this.state.userType[0].label === "Other";
    const isOtherOccupation =
      occupations.find((occupationItem) => occupationItem.id === occupation)
        ?.label === "Other";

    return (
      <View style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to AvoMD</Text>
          <Text style={styles.message}>{Env.QUESTIONNAIRE_MESSAGE}</Text>
          {Env.BUILD_VARIANT === buildVariants.CLIENT && (
            <>
              <Text style={styles.labelTitle}>What best describes you?</Text>
              <Text style={styles.labelDesc}>Select all that apply</Text>
              {/*<SearchableDropdown
              items={userTypes.filter(s => !this.state.userType.includes(s))}
              onItemSelect={(item) => {
                const items = this.state.userType;
                items.push(item);
                this.setState({ userType: items });
              }}
              listProps={{ nestedScrollEnabled: true }}
              textInputProps={{
                placeholder: this.randomUserType,
                underlineColorAndroid: "transparent",
                style: styles.textInput
              }}
              containerStyle={styles.containerStyle}
              itemsContainerStyle={{ maxHeight: 270 }}
              itemStyle={styles.itemStyle}
              itemTextStyle={{ color: "#222" }}/>*/}

              <DropDownPicker
                itemKey={1}
                items={userTypes.filter(
                  (s) => !this.state.userType.includes(s)
                )}
                schema={{
                  label: "label",
                  value: "id",
                }}
                multiple={true}
                open={this.state.pickerOpen}
                dropDownContainerStyle={styles.dropDownContainer}
                value={this.state.userType}
                setValue={this.setValue}
                dropDownDirection="BOTTOM"
                listMode="SCROLLVIEW"
                placeholder={this.randomUserType}
                itemStyle={{
                  justifyContent: "flex-start",
                }}
                textStyle={{ fontFamily: fontFamily.Regular }}
                onOpen={() => {
                  this.setPickerOpen(true);
                }}
                onClose={() => {
                  this.setPickerOpen(false);
                }}
              />
              <View style={styles.selectedItemsContainer}>
                {this.state.userType.map((item, i) => {
                  const founditem = userTypes.find(
                    (element) => element.id === item
                  );
                  return (
                    <TouchableOpacity
                      style={styles.selectedItem}
                      onPress={() => {
                        const items = this.state.userType.filter(
                          (sitem) => sitem !== item
                        );
                        this.setState({ userType: items });
                      }}
                    >
                      <Text style={styles.selectedItemText}>
                        {founditem.label}{" "}
                      </Text>
                      <Image
                        source={require("../images/close-white.png")}
                        style={{
                          width: getWidth(17),
                          height: getHeight(17),
                          marginVertical: getHeight(8),
                          marginHorizontal: getWidth(4),
                        }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
              {showConditionalOther ? (
                <View style={styles.conditionalInput}>
                  <Text style={styles.labelDesc}>Describe role "Other"</Text>
                  <TextInput
                    placeholder="Your role"
                    style={styles.textInput}
                    onChangeText={(conditional) =>
                      this.setState({ conditional })
                    }
                  />
                </View>
              ) : null}

              {!isOther && (
                <View>
                  <Text style={styles.labelTitle}>
                    Your Specialty? (If applicable)
                  </Text>
                  <Text style={styles.labelDesc}>Select all that apply</Text>
                  {/*<SearchableDropdown
                  onItemSelect={(item) => {
                    const items = this.state.specialties;
                    items.push(item);
                    this.setState({ specialties: items });
                  }}
                  items={specialties.filter(s => !this.state.specialties.includes(s))}
                  listProps={{ nestedScrollEnabled: true }}
                  textInputProps={{
                    placeholder: this.randomSpecialty,
                    underlineColorAndroid: "transparent",
                    style: styles.textInput
                  }}
                  containerStyle={styles.containerStyle}
                  itemsContainerStyle={{ maxHeight: 150 }}
                  itemStyle={styles.itemStyle}
                  itemTextStyle={{ color: "#222" }}/>*/}
                  <DropDownPicker
                    itemKey={2}
                    items={specialties.filter(
                      (s) => !this.state.specialties.includes(s)
                    )}
                    schema={{
                      label: "label",
                      value: "id",
                    }}
                    multiple={true}
                    disabled={this.state.userType.length > 0 ? false : true}
                    disabledStyle={{
                      opacity: 0.5,
                    }}
                    dropDownDirection="BOTTOM"
                    listMode="SCROLLVIEW"
                    value={this.state.specialties}
                    placeholder={this.randomSpecialty}
                    dropDownContainerStyle={styles.dropDownContainer}
                    open={this.state.specilityOpen}
                    onOpen={() => this.setPickerSpecilityOpen(true)}
                    onClose={() => this.setPickerSpecilityOpen(false)}
                    setValue={this.setSpecialtyValue}
                    itemStyle={{
                      justifyContent: "flex-start",
                    }}
                    textStyle={{ fontFamily: fontFamily.Regular }}
                  />
                  <View style={styles.selectedItemsContainer}>
                    {this.state.specialties.map((item, i) => {
                      const foundlitem = specialties.find(
                        (element) => element.id === item
                      );
                      return (
                        <TouchableOpacity
                          style={styles.selectedItem}
                          onPress={() => {
                            const items = this.state.specialties.filter(
                              (sitem) => sitem !== item
                            );
                            this.setState({ specialties: items });
                          }}
                        >
                          <Text style={styles.selectedItemText}>
                            {foundlitem.label}
                          </Text>
                          <Image
                            source={require("../images/close-white.png")}
                            style={{
                              width: getWidth(17),
                              height: getHeight(17),
                              marginVertical: getHeight(8),
                              marginHorizontal: getWidth(4),
                            }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {this.state.specilityOpen !== true && (
                    <View style={{ height: getHeight(210) }} />
                  )}
                </View>
              )}
            </>
          )}
          {Env.BUILD_VARIANT === buildVariants.COLUMBIA && (
            <>
              <Text style={styles.labelTitle}>Occupation?</Text>
              <DropDownPicker
                itemKey={3}
                items={occupations}
                schema={{
                  label: "label",
                  value: "id",
                }}
                dropDownDirection="BOTTOM"
                listMode="SCROLLVIEW"
                value={occupation}
                placeholder={this.randomOccupation}
                dropDownContainerStyle={styles.dropDownContainer}
                open={openOccupation}
                setOpen={this.setOpenOccupation}
                setValue={this.setOccupation}
                itemStyle={{
                  justifyContent: "flex-start",
                }}
                textStyle={{ fontFamily: fontFamily.Regular }}
              />
              {/*<DropDownPicker
                itemKey={3}
                items={occupations}
                schema={{
                  label: 'label',
                  value: 'id'
                }}
                listMode="SCROLLVIEW"
                containerStyle={{
                  height: 400
                }}
                placeholder={this.randomOccupation}
                open={openOccupation}
                value={occupation}
                setOpen={this.setOpenOccupation}
                setValue={this.setOccupation}
              />*/}
              {occupations.find(
                (occupationItem) => occupationItem.id === occupation
              )?.label === "Other" ? (
                <View style={styles.conditionalInput}>
                  <Text style={styles.labelDesc}>
                    Describe occupation "Other"
                  </Text>
                  <TextInput
                    placeholder="Your occupation"
                    style={styles.textInput}
                    onChangeText={(conditionalOccupation) =>
                      this.setState({ conditionalOccupation })
                    }
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
        <View
          style={{
            height: 80,
            justifyContent: "center",
            marginBottom: getHeight(20),
          }}
        >
          <View style={{ width: 28 }} />
          <View style={{ justifyContent: "center", alignSelf: "center" }}>
            <Pressable
              style={
                (this.state.userType.length && this.state.specialties.length) ||
                isOther
                  ? {
                      ...styles.continueButton,
                      backgroundColor: Colors.borderColor,
                      zIndex: 0,
                    }
                  : {
                      ...styles.continueButton,
                      backgroundColor: occupation
                        ? Colors.primaryColor
                        : "#D7D7D7",
                      shadowColor: "transparent",
                    }
              }
              onPress={this.validateContinue}
            >
              <Text
                style={{
                  fontFamily: fontFamily.Regular,
                  fontSize: getHeight(21),
                  fontWeight: "bold",
                  lineHeight: getWidth(25),
                }}
              >
                Continue
              </Text>
            </Pressable>
          </View>
          <View style={{ width: 20 }} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 75,
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: fontFamily.Bold,
    color: "#424242",
    textAlign: "left",
    fontSize: 35,
  },
  message: {
    fontFamily: fontFamily.Regular,
    color: "#424242",
    marginTop: 10,
    marginBottom: 10,
  },
  labelTitle: {
    fontFamily: fontFamily.Regular,
    color: "#424242",
    fontSize: 25,
    marginTop: 20,
    marginBottom: 15,
  },
  labelDesc: {
    fontFamily: fontFamily.Regular,
    color: "#FF8E3D",
    marginBottom: getHeight(5),
  },
  textInput: {
    fontFamily: fontFamily.Regular,
    padding: 10,
    borderWidth: 1,
    borderColor: "#adadad",
    marginLeft: -getWidth(3),
    borderRadius: 10,
  },
  containerStyle: {
    padding: 5,
  },
  itemStyle: {
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "#bbb",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
  },
  selectedItemsContainer: {
    marginTop: 5,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  selectedItem: {
    backgroundColor: Colors.infoBoxThemeColor,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginRight: 10,
    borderRadius: 10,
  },

  selectedItemText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 2,
    marginRight: 5,
  },
  selectedItemIcon: {
    color: "#FFFFFF",
  },
  conditionalInput: {
    marginTop: getHeight(15),
    marginLeft: getWidth(3),
  },
  notApplicable: {
    fontFamily: fontFamily.Regular,
    color: "gray",
    textDecorationLine: "underline",
  },
  continueButton: {
    borderRadius: getWidth(30),
    paddingLeft: getWidth(31),
    paddingRight: getWidth(29),
    paddingVertical: getHeight(16),
    marginHorizontal: getWidth(60),
    height: getHeight(58),
    width: getWidth(255),
    justifyContent: "center",
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowOffset: {
      height: getHeight(4),
      width: 0,
    },
    shadowRadius: getHeight(10),
  },
  SpecialtyDropdown: {
    height: getHeight(400),
  },
  dropDownContainer: {
    position: "relative",
    top: 0,
  },
});
