import React, { useEffect, useState } from "react";
import { getHeight, getWidth, isAndroid } from "../services/helper";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Keyboard,
} from "react-native";
import { fontFamily } from "../constants/strings";
import store from "../store";
import { SvgXml } from "react-native-svg";
import svgs from "../constants/svgs";

export default function SearchHistory({ searchKeyword, setKeyWord }) {
  // array list for the searched item
  const [searchHistoryList, setSearchHistoryList] = useState([]);
  // set dynamic length/height of the history box
  const [arrayLength, setLength] = useState(1);
  useEffect(() => {
    let { searchHistory } = store.getState().persist;
    searchKeyword =
      searchKeyword != null && searchKeyword != ""
        ? searchKeyword.trim()
        : searchKeyword;
    if (searchKeyword != "" && searchKeyword != null) {
      const newData = searchHistory?.filter((name) =>
        name.includes(searchKeyword)
      );
      setSearchHistoryList(newData);

      // check array list if it contains the keyword already
      if (searchHistory?.indexOf(searchKeyword) === -1) {
        let finalArray = [...searchHistory];
        //if length of the history greater than 10 then remove the last item
        if (finalArray.length >= 10) {
          finalArray.pop();
        }
        // add element in the array on the top of array
        finalArray.unshift(searchKeyword);
        setLength(searchHistoryList.length);
        store.dispatch({
          type: "SET_SEARCH_HISTORY",
          searchHistoryList: finalArray,
        });
      } else {
        setLength(newData?.length);
      }
    } else {
      setSearchHistoryList([]);
    }
  }, [searchKeyword]);
  const removeItem = (itemName) => {
    const newData = searchHistoryList.filter((item) => item != itemName);
    setSearchHistoryList(newData);
    setLength(newData.length);
    store.dispatch({
      type: "SET_SEARCH_HISTORY",
      searchHistoryList: newData,
    });
  };

  return (
    <>
      <View
        style={{
          height: getHeight((arrayLength ? arrayLength : 1) * 48),
          position: "absolute",
          marginHorizontal: getWidth(16),
          marginBottom: getHeight(10),
          top: isAndroid ? getHeight(100) : getHeight(130),
          zIndex: 999,
          elevation: 5,
          backgroundColor: "#ffffff",
          shadowColor: "#000000",
          shadowOpacity: 0.25,
          shadowOffset: {
            height: 1,
            width: 0,
          },
          shadowRadius: 1,
          borderTopEndRadius: 0,
          borderBottomWidth: 0,
          borderBottomRightRadius: getWidth(10),
          borderBottomLeftRadius: getWidth(10),
        }}
      >
        <FlatList
          data={searchHistoryList}
          onScrollBeginDrag={Keyboard.dismiss}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setKeyWord(item, true);
                setSearchHistoryList([]);
              }}
              style={searchStyles.historyItemView}
            >
              <SvgXml xml={svgs.history} style={searchStyles.historyIcon} />
              <View
                style={{
                  justifyContent: "space-between",
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 0.886,
                }}
              >
                <Text style={searchStyles.historyText}>{item}</Text>
                <TouchableOpacity
                  hitSlop={getHeight(10)}
                  onPress={() => {
                    removeItem(item);
                  }}
                >
                  <Image
                    style={searchStyles.crossIcon}
                    source={require("../images/history-cross.png")}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
}
const searchStyles = StyleSheet.create({
  historyItemView: {
    height: getHeight(48),
    width: getWidth(376),
    paddingHorizontal: getWidth(12),
    flexDirection: "row",
    alignItems: "center",
  },
  historyIcon: {
    height: getHeight(14),
    width: getWidth(17),
    marginEnd: getWidth(3),
  },
  crossIcon: {
    height: getHeight(9),
    width: getWidth(9),
    resizeMode: "contain",
  },
  historyText: {
    color: "#1E1F20",
    fontStyle: "normal",
    fontWeight: "400",
    fontSize: getHeight(16),
    fontFamily: fontFamily.Regular,
  },
});
