import React, { useState } from "react";
import { StyleSheet, ActivityIndicator, Image, View } from "react-native";

export default function RemoteImage(props: {
  imageURI: string;
  aspectRatio: number;
}) {
  const { imageURI, aspectRatio } = props;
  const [loading, setLoading] = useState(false);
  //render loading indicator if loading is true
  const renderLoading = () => {
    return (
      loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="gray" />
        </View>
      )
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Image
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        source={{ uri: imageURI }}
        style={{
          aspectRatio: aspectRatio,
          flex: 1,
        }}
      />
      {renderLoading()}
    </View>
  );
}
const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
