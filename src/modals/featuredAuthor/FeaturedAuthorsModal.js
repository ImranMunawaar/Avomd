import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import Colors from "../../constants/Colors";
import { fontFamily } from "../../constants/strings";
import { getHeight, getWidth } from "../../services/helper";

const FeaturedAuthorsModal = (props) => {
  const authors = props.authors;
  const authorsLength = authors.length - 1;
  return (
    <View>
      <ScrollView>
        <View>
          {authors.map((author, key) => (
            <View
              style={{
                ...styles.CardStyle,
                marginBottom: authorsLength === key ? 0 : getHeight(28),
              }}
            >
              <Image
                style={styles.authorImage}
                source={{
                  uri: author.photo
                    ? author.photo
                    : "https://i.stack.imgur.com/l60Hf.png",
                }}
              />
              <View style={styles.textView}>
                <Text style={styles.authorName}>{author.name}</Text>
                <Text style={styles.authorTitle}>{author.authorType}</Text>
                <Text style={styles.authorDescription}>
                  {author.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => props.closeModal()}
        style={styles.closeModalImage}
      >
        <Image
          style={{
            width: getWidth(30),
            height: getHeight(20),
          }}
          source={require("../../images/closesidebar.png")}
        />
      </TouchableOpacity>
    </View>
  );
};

export default FeaturedAuthorsModal;

const styles = StyleSheet.create({
  textView: {
    flexDirection: "column",
    marginStart: getWidth(11),
    paddingTop: getHeight(6),
    marginRight: getWidth(36),
  },
  CardStyle: {
    marginHorizontal: getWidth(18),
    flexDirection: "row",
  },
  authorName: {
    fontSize: getHeight(16),
    fontWeight: "700",
    fontFamily: fontFamily.Regular,
    color: Colors.bulletColor,
    lineHeight: getHeight(18),
  },
  authorImage: {
    width: getWidth(34),
    height: getHeight(34),
    borderRadius: getHeight(34) / 2,
  },
  authorTitle: {
    fontSize: getHeight(14),
    fontWeight: "400",
    fontFamily: fontFamily.Italic,
    color: "#A0A0A0",
    lineHeight: getHeight(18),
  },
  authorDescription: {
    fontSize: getHeight(14),
    fontWeight: "400",
    fontFamily: fontFamily.Regular,
    color: Colors.bulletColor,
    lineHeight: getHeight(18),
    marginRight: getWidth(20),
  },
  closeModalImage: {
    end: getWidth(10),
    alignSelf: "flex-end",
    position: "absolute",
  },
});
