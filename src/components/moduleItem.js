import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  ImageBackground,
} from "react-native";
import { getFormattedDate, getHeight, getWidth } from "../services/helper";
import { fontFamily } from "../constants/strings";
import store from "../store";

export class ModuleItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.teams = store.getState().persist.data.teams;
  }
  render() {
    let {
      module,
      isLast,
      isFirst,
      onModulePress,
      defaultAuthor,
      isPlaceHolder,
      screenState,
      toggleModuleFavorite,
    } = this.props;
    if (!module) {
      //console.log("!module");
      return null;
    }
    let featuredAuthor = module?.authorList;
    let featuredAuthorName = "";
    // Uncomment if featured author need to be a displayed here
    // if (featuredAuthor) {
    //   const [first] = featuredAuthor;
    //   featuredAuthorName =
    //     first.name + (featuredAuthor.length > 1 && ", et al");
    // }

    let team = this?.teams ? this?.teams[module.team] : null;
    let teamName, teamIcon;
    if (team) {
      teamName = team?.displayName;
      teamIcon = team?.icon;
      //console.log(teamName, teamIcon);
    }
    let authorName = module.author
      ? module.author
      : teamName
      ? teamName
      : "Team AvoMD et al.";

    //console.log("Module", module.title, teamIcon);
    const time = isPlaceHolder
      ? "Coming Soon"
      : `Updated ${
          module.serverTimestamp &&
          getFormattedDate(new Date(module.serverTimestamp), true)
        }  ${
          featuredAuthorName != ""
            ? "by " + featuredAuthorName
            : featuredAuthorName
        }`;
    return (
      <>
        <View
          style={{
            ...styles.rootView,
            marginBottom: isLast ? getWidth(20) : getWidth(8),
            opacity: isPlaceHolder ? 0.4 : 1,
          }}
          key={module.code}
        >
          <TouchableOpacity
            disabled={isPlaceHolder}
            onPress={() => onModulePress(module.code)}
          >
            <View style={styles.moduleView}>
              <View style={styles.moduleTextView}>
                <View style={styles.moduleTextWrapper}>
                  <Text
                    accessibilityLabel={module.code + "-title"}
                    accessible
                    style={styles.titleText}
                  >
                    {module.title}
                  </Text>
                  <TouchableOpacity
                    hitSlop={getHeight(10)}
                    onPress={() => toggleModuleFavorite(module)}
                  >
                    <Image
                      style={{
                        height: getHeight(16.74),
                        width: getHeight(15.99),
                      }}
                      source={
                        module.favorite
                          ? require("../images/star-filled.png")
                          : require("../images/star.png")
                      }
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  accessibilityLabel={module.code + "-time"}
                  accessible
                  style={styles.timeText}
                >
                  {time}
                </Text>
                {!screenState?.selectedChannel && (
                  <View style={styles.teamView}>
                    <ImageBackground
                      accessibilityLabel={module.code + "-teamIcon"}
                      accessible
                      source={
                        teamIcon
                          ? { uri: teamIcon }
                          : require("../images/channel-logo.png")
                      }
                      style={{
                        height: getHeight(24),
                        width: getHeight(24),
                      }}
                      imageStyle={styles.teamIcon}
                    />
                    <Text
                      accessibilityLabel={module.code + "-teamTitle"}
                      accessible
                      style={styles.authorText}
                      numberOfLines={1}
                    >
                      {authorName}
                    </Text>
                  </View>
                )}
              </View>
              {/* <View style={styles.starIconView}>
              <Image
                style={styles.starIcon}
                source={require("../images/star.png")}
              />
            </View> */}
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  rootView: {
    borderRadius: getHeight(8),
    borderWidth: 1,
    borderColor: "#E5EDF0",
    marginStart: getWidth(16),
    marginEnd: getWidth(16),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: getHeight(20),
    paddingTop: getHeight(12),
    paddingBottom: getHeight(15),
    flex: 1,
  },
  moduleView: {
    flexDirection: "row",
    flex: 2,
  },
  titleText: {
    fontSize: getHeight(18),
    color: "#1E1F20",
    marginBottom: getHeight(8),
    fontWeight: "600",
    flex: 1,
    fontFamily: fontFamily.SemiBold,
    marginEnd: getWidth(10),
  },
  authorText: {
    fontSize: getHeight(12),
    lineHeight: getHeight(16),
    color: "#1E1F20",
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    marginStart: getWidth(4),
    marginEnd: getWidth(20),
  },
  timeText: {
    fontSize: getHeight(12),
    color: "#566267",
    marginBottom: getHeight(5),
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
  },
  moduleTextView: {
    marginRight: getWidth(0),
    flex: 50,
  },
  moduleTextWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  descriptionText: {
    fontSize: getHeight(14),
    color: "#515151",
    lineHeight: getHeight(18),
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
  },
  starIconView: {
    marginTop: getHeight(5),
    flex: 2,
  },
  starIcon: {
    width: getWidth(20),
    height: getHeight(20),
  },
  teamIcon: {
    borderRadius: getHeight(4),
    borderWidth: 1,
    borderColor: "#E5EDF0",
  },
  teamView: {
    marginTop: getHeight(4),
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ModuleItem;
