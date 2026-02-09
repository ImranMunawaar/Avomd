import React, { Component } from "react";
import {
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  Pressable
} from "react-native";
import MaskedView from "../components/maskedView";
import MaskedElement from "../components/maskElement";
import * as helper from "../services/helper";
import Colors from "../constants/Colors";
import Env from "../constants/Env";
import { fontFamily } from "../constants/strings";

const authorPhotos = {
  columbia_author1:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fcolumbia-author1.png?alt=media&token=6e3b7860-d517-436e-9a48-dc4d1161040b",
  columbia_author2:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fcolumbia_author2.png?alt=media&token=12c4f199-030d-4d36-a84a-e19fcd36e710",
  columbia_author3:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fcolumbia-author3.jpg?alt=media&token=51f8829d-dfc1-4907-ab78-8c7ed993d045",
  photo_cohn:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_cohn.jpg?alt=media&token=6cc68687-e9c9-4664-a4e6-ec147806c4fd",
  photo_pj:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_pj.jpg?alt=media&token=feb0b3fe-ea89-4d57-82fa-3f44f779a18b",
  photo_jang:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_jang.jpg?alt=media&token=dbb906e4-a3ed-4e5d-ba8a-d5bcd9648b14",
  photo_yair:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_yair.jpg?alt=media&token=0da73cb4-0c06-4c96-9759-bbd6d4b3fe3f",
};

export class Authors extends Component {
  constructor(props) {
    super(props);
  }

  onNextPress = () => {
    this.props.navigation.navigate("PaymentPlan");
  };

  render() {
    return (
      <View style={styles.fullSize}>
        <View
          style={{
            paddingStart: helper.getWidth(41),
            paddingEnd: helper.getWidth(39),
            flex: 1,
          }}
        >
          <Text style={styles.onboardTitleLine1}>
            {Env.ON_BOARD_TITLE_LINE_1}
          </Text>
          <Text style={styles.onboardTitleLine2}>
            {Env.ON_BOARD_TITLE_LINE_2}
          </Text>
          <MaskedView element={<MaskedElement />}>
            <FlatList
              showsVerticalScrollIndicator={false}
              style={styles.authorList}
              data={Env.AUTHOR_LIST}
              keyExtractor={(item, index) => item.name}
              renderItem={({ item, index }) => {
                return (
                  <View
                    style={{
                      marginTop: helper.getHeight(index === 0 ? 43.3 : 15),
                      marginBottom: helper.getHeight(
                        index === Env.AUTHOR_LIST.length - 1 ? 43.3 : 0
                      ),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 5,
                      }}
                    >
                      <Image
                        source={{ uri: authorPhotos[item.photo] }}
                        style={styles.authorImage}
                      />
                      <View>
                        <Text style={styles.authorName}>{item.name}</Text>
                        <Text style={styles.authorType}>{item.authorType}</Text>
                      </View>
                    </View>
                    <Text style={styles.authorDescription}>
                      {item.description}
                    </Text>
                  </View>
                );
              }}
            />
          </MaskedView>
        </View>
        <Pressable
          onPress={this.onNextPress}
          style={[
            styles.nextButton,
            {
              marginBottom: helper.getHeight(59),
            },
          ]}
        >
          <Text style={styles.nextText}>Next</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullSize: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  onboardTitleLine1: {
    fontSize: helper.getHeight(30),
    fontFamily: fontFamily.Bold,
    fontWeight: "900",
    marginTop: helper.getHeight(71),
    color: "#000000",
  },
  onboardTitleLine2: {
    fontSize: helper.getHeight(22),
    color: "#000000",
    fontFamily: fontFamily.Regular,
  },
  description: {
    fontSize: helper.getHeight(24),
    fontFamily: fontFamily.Italic,
    marginTop: helper.getHeight(15),
  },
  authorList: {},
  authorImage: {
    width: helper.getHeight(49),
    height: helper.getHeight(49),
    borderRadius: helper.getHeight(49 / 2),
    marginEnd: helper.getWidth(11),
  },
  authorName: {
    fontSize: helper.getHeight(16),
    fontWeight: "bold",
    color: "#515151",
    width: helper.getWidth(230),
  },
  authorType: {
    fontSize: helper.getHeight(14),
    color: "#A0A0A0",
    fontFamily: fontFamily.Italic,
  },
  authorDescription: {
    fontSize: helper.getHeight(14),
    color: "#343434",
    overflow: "hidden",
    fontFamily: fontFamily.Regular,
    lineHeight: helper.getHeight(22),
  },
  nextButton: {
    width: helper.getWidth(255),
    height: helper.getHeight(58),
    borderRadius: helper.getHeight(58 / 2),
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    backgroundColor: Colors.button,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: helper.getHeight(7),
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
    fontSize: helper.getHeight(21),
    width: helper.getWidth(255),
    textAlign: "center",
  },
});
