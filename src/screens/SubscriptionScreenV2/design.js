import React, { Component, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  TextInput
} from "react-native";
import { connect } from "react-redux";
import { PageHeaderV2 } from "../../components/PageHeaderV2";
import { globalStyles } from "../../components/GlobalStyles";
import { Section } from "../../components/Section";
import * as Analytics from "../../services/Analytics";
import styles from "./styles";
import ChannelItem from "./channelitem";
import SwipeableChannelItem from "./swipeableChannelItem";
import PasswordInput from "../../components/passwordInput";
import _ from "lodash";
import { getHeight, getWidth } from "../../services/helper";
import { debounce } from "lodash";

const Design = ({
  _this,
  screenState,
  myChannels,
  allChannels,
  activeChannels,
}) => {
  const { modules } = _this.props;
  const {
    institutionalChannels,
    genricChannels,
    showPasswordInput,
    keyword,
    isSearchEnabled,
  } = screenState;
  const [isLoading, setIsLoading] = useState(true);

  let searchList =
    allChannels &&
    Object.values(allChannels).filter(
      (e) =>
        e != null &&
        ((keyword && keyword.toLowerCase() === e.code.toLowerCase()) ||
          (e.publicity !== "hidden" &&
            _this._matchTextToKeyword(e.channelTitle)))
    );

  let subscribedChannels = _.sortBy(
    myChannels,
    (myChannel) =>
      myChannel &&
      myChannel.channelTitle &&
      myChannel.channelTitle.toLowerCase()
  ).filter((e) => e != null);
  return (
    <View
      style={{
        backgroundColor:
          subscribedChannels.length === 0 && !isSearchEnabled
            ? "#ffffff"
            : "#f6f6f6",
        flex: 1,
      }}
    >
      <PageHeaderV2
        onBackPress={() => {
          /* if (isSearchEnabled) {
            _this.toggleSearchState();
          } else { */
          Analytics.track(Analytics.events.EXIT_SUBSCRIPTION_SCREEN, {
            duration: _this.duration(),
          });
          _this.props.navigation.goBack();
          /* } */
        }}
        title={isSearchEnabled ? "Subscribe to Channels" : "Channels"}
      />
      {isSearchEnabled ? (
        <View
          style={{
            elevation: 4,
            shadowColor: "#000000",
            shadowOpacity: 0.15,
            shadowOffset: {
              height: 4,
              width: 0,
            },
            shadowRadius: 4,
          }}
        >
          <View
            style={[
              styles.searchContainer,
              {
                paddingBottom:
                  searchList && searchList.length > 0 ? getHeight(9) : 0,
              },
            ]}
          >
            <View style={styles.searchInputContainer}>
              <View style={styles.searchWrapper}>
                <Image
                  source={{ uri: "searchicon" }}
                  style={{
                    height: getHeight(20),
                    width: getWidth(19),
                    marginStart: getWidth(16),
                    resizeMode: "contain",
                    marginEnd: getWidth(5),
                  }}
                />
                <TextInput
                  ref={_this.setSearchInputRef}
                  style={styles.searchInput}
                  onChangeText={debounce(_this.onSearchText, 1000)}
                  placeholder={"Add code or Search"}
                  placeholderTextColor={"#51515125"}
                />
              </View>
              {keyword && keyword.length > 0 ? (
                <TouchableOpacity
                  onPress={_this.clearSearch}
                  style={{ backgroundColor: "transparent" }}
                >
                  <Image
                    source={require("../../images/close-grey.png")}
                    style={{
                      width: getHeight(15),
                      height: getHeight(15),
                      marginEnd: getWidth(16),
                    }}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
            {searchList && (
              <FlatList
                data={searchList}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  let description = _this.getChannelDescription(item);
                  return (
                    <ChannelItem
                      description={description}
                      channel={item}
                      isActiveChannel={false}
                      isAdded={activeChannels.includes(item.code)}
                      onAddPress={() => _this.onChannelAddPress(item)}
                      isLast={index === searchList.length - 1}
                    />
                  );
                }}
                keyExtractor={(item, index) => item.code}
              />
            )}
          </View>
        </View>
      ) : (
        <>
          {subscribedChannels.length === 0 && (
            <View
              style={{
                flex: 1,
                top: getHeight(100),
                marginBottom: getHeight(400),
              }}
            >
              <View style={styles.emptyStateSubView}>
                <Image
                  source={require("../../images/empty.png")}
                  style={{ width: getWidth(268), height: getHeight(268) }}
                />
              </View>
              <View style={styles.emptyStateSubView}>
                <Text numberOfLines={2} style={styles.emptyStateText}>
                  You don’t have any subscribed channels yet!
                </Text>
              </View>
              <View style={styles.emptyStateSubView}>
                <Text numberOfLines={2} style={styles.emptyStateSubText}>
                  Get started by adding channels
                </Text>
              </View>
            </View>
          )}
          {subscribedChannels.length === 0 ? (
            <View style={styles.emptyStateSubView}>
              <Pressable
                onPress={_this.addSubsButtonPress}
                style={styles.addEmptyStateButton}
              >
                <Text style={styles.emptyStateAddSubsButtonText}>
                  + Add channel
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={_this.addSubsButtonPress}
              style={styles.addSubsButton}
            >
              <Text style={styles.addSubsButtonText}>Add a new channel</Text>
            </Pressable>
          )}
        </>
      )}
      {isSearchEnabled ? (
        <ScrollView>
          <View>
            {subscribedChannels && subscribedChannels.length > 0 && (
              <Text style={styles.sectionTitle}>Your Channels</Text>
            )}
            {subscribedChannels && (
              <FlatList
                data={subscribedChannels}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  let description = _this.getChannelDescription(item);
                  setIsLoading(false);
                  return (
                    <ChannelItem
                      description={description}
                      channel={item}
                      isSectionList
                      isPublic={item.publicity === "public"}
                      isAdded={true}
                      onAddPress={() => _this.onChannelAddPress(item)}
                      isLast={index === subscribedChannels.length - 1}
                      isFirst={index === 0}
                    />
                  );
                }}
                keyExtractor={(item, index) => item.code}
              />
            )}
            {institutionalChannels && institutionalChannels.length > 0 && (
              <Text style={styles.sectionTitle}>Institution</Text>
            )}
            {institutionalChannels && (
              <FlatList
                data={institutionalChannels}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  let description = _this.getChannelDescription(item);
                  setIsLoading(false);
                  return (
                    <ChannelItem
                      description={description}
                      channel={item}
                      isSectionList
                      isFirst={index === 0}
                      isPublic={item.publicity === "public"}
                      isAdded={activeChannels.includes(item.code)}
                      onAddPress={() => _this.onChannelAddPress(item)}
                      isLast={index === institutionalChannels.length - 1}
                    />
                  );
                }}
                keyExtractor={(item, index) => item.code}
              />
            )}
            {genricChannels && genricChannels.length > 0 && (
              <Text style={styles.sectionTitle}>Generic</Text>
            )}
            {genricChannels && (
              <FlatList
                data={genricChannels}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => {
                  let description = _this.getChannelDescription(item);
                  setIsLoading(false);
                  return (
                    <ChannelItem
                      description={description}
                      channel={item}
                      isSectionList
                      isPublic={item.publicity === "public"}
                      isAdded={activeChannels.includes(item.code)}
                      onAddPress={() => _this.onChannelAddPress(item)}
                      isLast={index === genricChannels.length - 1}
                      isFirst={index === 0}
                    />
                  );
                }}
                keyExtractor={(item, index) => item.code}
              />
            )}
          </View>
          {isLoading && <ActivityIndicator color="#2DDF89" />}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {subscribedChannels && (
            <FlatList
              data={subscribedChannels}
              renderItem={({ item, index }) => {
                let description = _this.getChannelDescription(item);
                return (
                  <SwipeableChannelItem
                    description={description}
                    channel={item}
                    onDeletePress={() => _this.removeChannel(item)}
                    isLast={index === subscribedChannels.length - 1}
                  />
                );
              }}
              keyExtractor={(item, index) => item.code}
            />
          )}
        </View>
      )}
      {showPasswordInput && <PasswordInput _this={_this} />}
    </View>
  );
};

export default Design;
