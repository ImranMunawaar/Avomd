import React, { Component } from 'react';
// This is related to old design. If we need we have to redesign according to new react native components
// import { Container, Content, Card, CardItem } from 'native-base';
import { Linking, StyleSheet, View, Text } from 'react-native';
// import { PageHeader } from '../components/PageHeader';
import Colors from '../constants/Colors';

export class ReferenceScreen extends Component {
  render() {
    const { navigation, route } = this.props;
    const reference = route.params?.reference;
    return (
      null
      // <Container>
      //   <PageHeader onBackPress={() => navigation.goBack()} title={'Reference'} />
      //   <Content>
      //     <Card style={styles.card}>
      //       <CardItem
      //         button
      //         style={styles.cardItem}
      //         onPress={() => {
      //           Linking.openURL(reference.url);
      //         }}>
      //         <Text>{reference.source}</Text>
      //         <View style={{ height: 15 }} />
      //         <Text style={{ color: Colors.infoBoxThemeColor }}>{reference.url}</Text>
      //       </CardItem>
      //     </Card>
      //   </Content>
      // </Container>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    marginLeft: 9,
    marginRight: 9,
    borderRadius: 8,
    paddingLeft: 0,
    paddingRight: 0,
  },
  cardItem: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 0,
    paddingRight: 0,
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
});
