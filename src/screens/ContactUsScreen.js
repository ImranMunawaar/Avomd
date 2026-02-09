import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
// This is related to old design. If we need we have to redesign according to new react native components
// import { Container, Content, Icon } from 'native-base';

export class ContactUsScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Settings',
    headerLeft: (
      <Icon
        type={"Ionicons"}
        name="ios-menu"
        style={{ paddingLeft: 10 }}
        onPress={() => navigation.navigate('DrawerOpen')}
      />
    ),
  });

  render() {
    return (
      null
      // <Container>
      //   <Content
      //     contentContainerStyle={{
      //       flex: 1,
      //       alignItems: 'center',
      //       justifyContent: 'center',
      //       padding: 10,
      //     }}>
      //     <Button full onPress={() => this.props.navigation.navigate('Home')}>
      //       <Text style={{ color: 'white' }}>Go to Home screen</Text>
      //     </Button>
      //   </Content>
      // </Container>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    height: 24,
    width: 24,
  },
});
