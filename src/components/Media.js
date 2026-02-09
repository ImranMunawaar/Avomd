import React, { Component } from "react";
import { View, Image, TouchableOpacity, Modal } from "react-native";
import { numericToString, isValid } from "../models/modules";
import YoutubePlayer from "react-native-youtube-iframe";
import commonImages from "../images/common/CommonImages";
import { globalStyles } from "./GlobalStyles";
import Layout from "../constants/Layout";
import * as Linking from "expo-linking";
import { getHeight, getWidth } from "../services/helper";
import ImageViewer from "react-native-image-zoom-viewer";
import { getStatusBarHeight } from "../services/iphoneXHelper";
import RemoteImage from "./RemoteImage";

export default class Media extends Component {
  state = {
    remoteImageHeight: getWidth(100),
    remoteImageWidth: 0,
    remoteImageAspectRatio: 1,
    visible: false,
    remoteImageURI: null,
    imageLink: null,
    imageHeight: null,
    imageWidth: null,
    videoId: null,
    images: [],
  };
  async componentWillMount() {
    const { info } = this.props;

    const isRemote = await this.IsURL(info.imageLink);
    if (info.videoLink) {
      //set state for videoId
      this.setState({ videoId: Linking.parse(info.videoLink).queryParams.v });
    }

    if (isRemote) {
      this.setState({
        remoteImageURI: info.imageLink,
        images: [...this.state.images, { url: info.imageLink }],
      });

      if (info.imageHeight && info.imageWidth) {
        this.setState({
          imageHeight: info.imageHeight,
          imageWidth: info.imageWidth,
          remoteImageAspectRatio: info.imageWidth / info.imageHeight,
        });
      } else {
        Image.getSize(
          info.imageLink,
          (width, height) => {
            const imageHeight = height;
            const imageWidth = width;

            this.setState({
              imageHeight: height,
              imageWidth: width,
              remoteImageAspectRatio: imageWidth / imageHeight,
            });
          },
          (error) => console.error("Image.getSize error", error)
        );
      }
    }
    if (isValid(info.imageLink)) {
      if (isValid(commonImages[info.imageLink])) {
        //set ImageLink
        //this.setState({});
        const { width, height } = Image.resolveAssetSource(
          commonImages[info.imageLink]
        );
        // set width and height as states
        this.setState({
          imageLink: commonImages[info.imageLink],
          imageHeight: height,
          imageWidth: width,
        });
      }
    }
  }

  async IsURL(url) {
    if (!url) return false;
    return await Linking.canOpenURL(url);
  }

  render() {
    const { extraSpace } = this.props;
    const {
      images,
      visible,
      videoId,
      imageLink,
      imageHeight,
      imageWidth,
      remoteImageURI,
      remoteImageWidth,
      remoteImageHeight,
      remoteImageAspectRatio,
    } = this.state;

    return (
      <View
        style={{ marginBottom: getHeight(10) }}
        onLayout={(event) => {
          if (remoteImageWidth !== 0) return;
          const layout = event.nativeEvent.layout;
          this.setState({
            remoteImageWidth: layout.width,
          });
        }}
      >
        {isValid(imageLink) && (
          <View>
            <View
              style={{
                height: imageWidth
                  ? ((Layout.window.width - extraSpace) * imageHeight) /
                    imageWidth
                  : null,
                width: Layout.window.width - extraSpace,
              }}
            >
              <Image
                style={{
                  flex: 1,
                  aspectRatio: imageWidth / imageHeight,
                }}
                source={imageLink}
              />
            </View>
          </View>
        )}

        {isValid(remoteImageURI) && (
          <View>
            <View
              style={{
                height: remoteImageWidth
                  ? remoteImageWidth / remoteImageAspectRatio
                  : null,
                width: remoteImageWidth,
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                }}
                onPress={() => {
                  this.setState({
                    visible: true,
                  });
                }}
              >
                <RemoteImage
                  aspectRatio={remoteImageAspectRatio}
                  imageURI={remoteImageURI}
                />
              </TouchableOpacity>
              <Modal //Use Modal to show image in full screen
                visible={visible}
                onRequestClose={() => this.setState({ visible: false })}
              >
                <ImageViewer //For zoom image functionality
                  imageUrls={images}
                  renderIndicator={() => null}
                  saveToLocalByLongPress={false}
                  renderHeader={() => (
                    //add cancel button
                    <TouchableOpacity
                      onPress={() => {
                        {
                          this.setState({ visible: false });
                        }
                      }}
                      style={{
                        position: "absolute",
                        zIndex: 500,
                        alignSelf: "flex-end",
                        paddingHorizontal: getWidth(20),
                        marginTop: getStatusBarHeight(true),
                        paddingVertical: getHeight(27),
                      }}
                    >
                      <Image
                        source={require("../images/close-grey.png")}
                        style={{
                          width: getWidth(17),
                          height: getHeight(17),
                        }}
                      />
                    </TouchableOpacity>
                  )}
                />
              </Modal>
            </View>
          </View>
        )}

        {videoId && (
          <View style={{ alignItems: "center" }}>
            <YoutubePlayer
              width={Layout.window.width - extraSpace}
              height={((Layout.window.width - extraSpace) * 9) / 16}
              videoId={videoId}
            />
          </View>
        )}
      </View>
    );
  }
}
