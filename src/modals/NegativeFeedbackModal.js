import React, { Component } from 'react';
import { Linking, View, StyleSheet, ScrollView, Image, Dimensions, Text, Button, } from 'react-native';
// This is related to old design. If we need we have to redesign according to new react native components
// import { Container, Content, Card, CardItem, Icon } from 'native-base';
import Modal from 'react-native-modal';
import { globalStyles } from '../components/GlobalStyles';

export class NegativeFeedbackModal extends Component {
  state = {
    visibleModalId: null,
  };

  handleOnScroll = event => {
    this.setState({
      scrollOffset: event.nativeEvent.contentOffset.y,
    });
  };

  handleScrollTo = p => {
    if (this.scrollViewRef) {
      this.scrollViewRef.scrollTo(p);
    }
  };

  render() {
    //const { info, onClose, isInfoAvailable } = this.props;
    const { onClose, isVisible } = this.props;
    const win = Dimensions.get('window');

    return (
      <Modal
        style={{ margin: 0 }}
        isVisible={isVisible}
        onBackButtonPress={onClose}
        //onSwipeComplete={onClose}
        //swipeDirection="down"
        //scrollTo={this.handleScrollTo}
        //scrollOffset={this.state.scrollOffset}
        //scrollOffsetMax={10000} // content height - ScrollView height
      >
        {/* <Content style={{ marginTop: 40, borderRadius: 8, backgroundColor: '#EEEEEE' }}>
          <View style={styles.scrollableModal}>
            <ScrollView
              ref={ref => (this.scrollViewRef = ref)}
              onScroll={this.handleOnScroll}
              scrollEventThrottle={160}
              decelerationRate={'fast'}
              //onScrollBeginDrag={this.handleOnScroll}
              //onMomentumScrollEnd={this.handleOnScroll}
              //onScrollEndDrag={this.handleOnScroll}
            >
              <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button transparent onPress={onClose}>
                  <Icon
                    type={'Ionicons'}
                    style={{ padding: 5, fontSize: 30, color: 'black' }}
                    name={'ios-close-circle'}
                  />
                </Button>
              </View>
              <Card style={styles.cardStyle}>
                <CardItem header bordered style={globalStyles.cardHeaderStyle}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>Whatthe</Text>
                </CardItem>
              </Card>
            </ScrollView>
          </View>
        </Content> */}
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 8,
  },
});
