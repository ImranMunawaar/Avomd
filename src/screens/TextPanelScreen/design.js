import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import remoteConfig from "@react-native-firebase/remote-config";
import { getHeight, getWidth } from "../../services/helper";
import ToastMsg from "../../components/theme/ToastMsg";
import { SvgXml } from "react-native-svg";
import svgs from "../../constants/svgs";
import { TypeListModal } from "../../modals/TypeListModal";
import { DeleteAccountModal } from "../../modals/DeleteAccountModal";
import { ChangePasswordModal } from "../../modals/ChangePasswordModal";
import { GenericInfoModal } from "../../modals/GenericInfoModal";

import { PageHeaderV2 } from "../../components/PageHeaderV2";
import styles from "./styles";
import Toast from "react-native-toast-message";
import _ from "lodash";
import IAPStore from "../../services/IAPStore";
import Env from "../../constants/Env";
import { buildVariants } from "../../constants/strings";

const Design = ({ screenProps, screenParams }) => {
  const {
    title,
    text,
    setIsFocused,
    setIsSubmitted,
    isSubmitted,
    onChangeText,
    submitTextInputValue,
  } = screenParams;
  const { navigation } = screenProps;
  const [fullText, onChangeFullText] = React.useState(text);
  return (
    <KeyboardAvoidingView
      enabled={Platform.OS === "ios"}
      behavior={"padding"}
      style={styles.mainView}
    >
      <PageHeaderV2
        onBackPress={() => {
          //navigation.goBack();
          onChangeText(fullText);
          navigation.goBack();
        }}
        title={title}
      />
      <View
        style={[
          styles.innerView,
          { backgroundColor: isSubmitted ? "#F5F8F9" : "white" },
        ]}
      >
        <TextInput
          style={styles.fieldInput}
          placeholder={"Start typing"}
          multiline
          numberOfLines={4}
          scrollEnabled
          value={fullText}
          onChangeText={onChangeFullText}
          editable={!isSubmitted}
        />
        {!isSubmitted && (
          <TouchableOpacity
            style={{ alignSelf: "flex-end" }}
            hitSlop={getHeight(15)}
            onPress={() => {
              Keyboard.dismiss();
              setIsSubmitted(true);
              setIsFocused(false);
              onChangeText(fullText);
              submitTextInputValue(fullText);

              navigation.goBack();
            }}
          >
            <Image
              style={styles.sendButtonImage}
              source={{ uri: "sendbuttonenabled" }}
            />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default Design;
