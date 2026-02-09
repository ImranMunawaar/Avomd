import React, { Component } from "react";
import { View, KeyboardAvoidingView, Alert, FlatList, TouchableOpacity, Text, TextInput } from "react-native";
// This import is related to preop application and native base. If we need that component we have to import it from react native.
// import {
//   Icon,
//   Header,
//   Spinner
// } from "native-base";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import _ from "lodash";
import {
  isValid
} from "../../models/modules";
import ModuleItem from "./moduleItem";

const defaultItems = [{
  code: "item1",
  title: "Preoperative Pulmonary Evaluations",
  author: "Joongheum Park, MD, et.al.",
  serverTimestamp: Date.now() - 864000000, //10 days from now
  description: "Coming Soon"
}, {
  code: "item2",
  title: "In-patient Preoperative Pulmonary Evaluations",
  author: "Joongheum Park, MD, et.al.",
  serverTimestamp: Date.now() - 864000000, //10 days from now
  description: "Coming Soon"
}];

const Design =
  ({ _this }) => {
    let { drawer, modules, enabledModules, loadingData } = _this.props;
    let { keyword, modulesLoading } = _this.state;

    let sortedModules = _.sortBy(modules, (module) => module && module.title && module.title.toLowerCase());
    const shownModules =
      isValid(modules) &&
      sortedModules.filter(
        sortedModule =>
          sortedModule != null &&
          enabledModules.includes(sortedModule.code) &&
          _this._matchTextToKeyword(sortedModule.title)
      ).map(module => modules[module.code]);

    shownModules.push(...defaultItems);
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
        {/* <Header
          style={{
            shadowColor: "#EDEDED",
            shadowOpacity: 1,
            shadowOffset: {
              height: 10,
              width: 0
            },
            shadowRadius: 5,
            borderBottomWidth: 0,
            justifyContent: "center",
            alignItems: "center"
          }}
          iosBarStyle={"dark-content"}>
          <TouchableOpacity onPress={() => {
            drawer._root.open();
          }}>
            <Icon
              type={"Feather"}
              name={"menu"}
              style={{
                fontSize: 20,
                color: "#00000080",
                marginStart: 15
              }}/>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon
                type={"Feather"}
                name={"search"}
                style={{
                  fontSize: 20,
                  color: "#00000080",
                  marginStart: 16
                }}/>
              <TextInput
                ref={_this.setSearchInputRef}
                style={styles.searchInput}
                onChangeText={_this.onSearchText}
                placeholder={"Search here"}
                placeholderTextColor={"#51515140"}/>
              {(keyword && keyword.length > 0) ? <TouchableOpacity
                onPress={_this.clearSearch}
                style={{ backgroundColor: "transparent" }}>
                <Ionicons
                  name={"ios-close"}
                  size={25}
                  color={"#00000080"}
                  style={{
                    marginEnd: 16
                  }}/>
              </TouchableOpacity> : null}
            </View>
          </View>
        </Header> */}
        <FlatList
          refreshing={modulesLoading}
          onRefresh={_this._loadModules}
          data={shownModules}
          renderItem={({ item, index }) =>
            <ModuleItem
              module={item}
              onModulePress={() => _this.gotoModule(item.code)}
              isLast={index === shownModules.length - 1}
              isFirst={index === 0}/>}
          keyExtractor={(item, index) => item.code}/>
        {loadingData && (
          <View style={styles.loadingIndicatorContainer}>
            <View style={styles.loadingIndicatorBackground}/>
            {/* <Spinner color="white"/> */}
            <Text style={{ textAlign: "center", color: "white" }}>{_this.getLoadingText()}</Text>
          </View>
        )}
      </View>
    );
  };
export default Design;
