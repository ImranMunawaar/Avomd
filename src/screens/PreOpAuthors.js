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
import { fontWeight } from "../constants/strings";
import MaskedView from "../components/maskedView";
import MaskedElement from "../components/maskElement";
import * as helper from "../services/helper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authorPhotos = {
  photo_cohn:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_cohn.jpg?alt=media&token=6cc68687-e9c9-4664-a4e6-ec147806c4fd",
  photo_pj:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_pj.jpg?alt=media&token=feb0b3fe-ea89-4d57-82fa-3f44f779a18b",
  photo_jang:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_jang.jpg?alt=media&token=dbb906e4-a3ed-4e5d-ba8a-d5bcd9648b14",
  photo_yair:
    "https://firebasestorage.googleapis.com/v0/b/avomd-playground.appspot.com/o/profilePhotos%2Fphoto_yair.jpg?alt=media&token=0da73cb4-0c06-4c96-9759-bbd6d4b3fe3f",
};

export class PreOpAuthors extends Component {
  constructor(props) {
    super(props);
    this.preopConfig = require("../../preOpConfig");
  }

  async componentDidMount() {}

  onNextPress = () => {
    this.props.navigation.navigate("PreOpPaymentPlan");
  };

  render() {
    return (
      <View style={styles.fullSize}>
        <View style={{ paddingStart: 54, paddingEnd: 39, flex: 1 }}>
          <Text style={styles.onboardTitleLine1}>
            {this.preopConfig.preop.onboardTitleLine1}
          </Text>
          <Text style={styles.onboardTitleLine2}>
            {this.preopConfig.preop.onboardTitleLine2}
          </Text>
          <Text style={styles.description}>
            {this.preopConfig.preop.authorDescription}
          </Text>
          <MaskedView element={<MaskedElement />}>
            <FlatList
              showsVerticalScrollIndicator={false}
              style={styles.authorList}
              data={this.preopConfig.preop.authorList}
              keyExtractor={(item, index) => item.name}
              renderItem={({ item, index }) => {
                return (
                  <View
                    style={{
                      marginTop: index === 0 ? 43.3 : 15,
                      marginBottom:
                        index === this.preopConfig.preop.authorList.length - 1
                          ? 43.3
                          : 0,
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
              marginBottom: helper.getHeight(79),
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
    fontSize: helper.getHeight(60),
    fontWeight: "bold",
    marginTop: helper.getHeight(120),
  },
  onboardTitleLine2: {
    fontSize: helper.getHeight(40),
  },
  description: {
    fontSize: helper.getHeight(24),
    fontStyle: "italic",
    marginTop: helper.getHeight(15),
  },
  authorList: {},
  authorImage: {
    width: helper.getHeight(34),
    height: helper.getHeight(34),
    borderRadius: helper.getHeight(34 / 2),
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
    fontStyle: "italic",
  },
  authorDescription: {
    fontSize: helper.getHeight(14),
    color: "#515151",
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
    backgroundColor: "#14DB58",
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
