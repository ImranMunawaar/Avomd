import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Modal from "react-native-modal";
import Colors from "../../constants/Colors";
import { fontFamily } from "../../constants/strings";
import { getHeight, getWidth } from "../../services/helper";
import FeaturedAuthorsModal from "./FeaturedAuthorsModal";

const FeaturedAuthors = (props) => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);

  const closeModal = () => setOpen(false);

  const authors = props.authors;

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={openModal}>
        <Text style={styles.authorsText}>
          {authors.map((value) => value.name).join(", ")}
        </Text>
      </TouchableOpacity>
      <Modal
        isVisible={open}
        onBackButtonPress={closeModal}
        propagateSwipe={true}
      >
        <View style={styles.modalView}>
          <FeaturedAuthorsModal authors={authors} closeModal={closeModal} />
        </View>
      </Modal>
    </View>
  );
};

export default FeaturedAuthors;

const styles = StyleSheet.create({
  header: {
    marginBottom: getHeight(10),
    backgroundColor: "#FFFFFF",
  },
  authorsText: {
    color: Colors.primaryColor,
    fontSize: getHeight(15),
    fontWeight: "500",
    fontFamily: fontFamily.Regular,
    paddingHorizontal: getWidth(30),
  },
  modalView: {
    backgroundColor: "#FFFFFF",
    paddingTop: getHeight(18),
    paddingBottom: getHeight(28),
    borderRadius: getHeight(25),
    maxHeight: getHeight(553),
  },
});
