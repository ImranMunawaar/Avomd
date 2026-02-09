import React, { Component } from 'react';
import { Linking, View, StyleSheet, Image, Text } from 'react-native';
// This is related to old design. If we need we have to redesign according to new react native components
// import { Container, Content, Card, CardItem } from 'native-base';
import { getReference } from '../models/modules';
import { globalStyles } from '../components/GlobalStyles';
import { Section } from '../components/Section';

export class InfoScreen extends Component {
  render() {
    const { navigation, route } = this.props;
    const info = route.params?.info;
    return (
      null
      // <Container>
      //   <PageHeader onBackPress={() => navigation.goBack()} title={''} />
      //   <Content>
      //     <Section title={'Content'} />
      //     <Card style={styles.cardStyle}>
      //       <CardItem header bordered style={globalStyles.cardHeaderStyle}>
      //         <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>{info.title}</Text>
      //       </CardItem>
      //       {info.imageLink && (
      //         <View>
      //           <CardItem style={globalStyles.singleCardItem}>
      //             <Text>
      //               <Image
      //                 style={{ width: window.width - 50, height: 400, resizeMode: 'cover' }}
      //                 source={require('../images/common/furuncle.jpg')}
      //               />
      //             </Text>
      //           </CardItem>
      //         </View>
      //       )}
      //       <CardItem style={globalStyles.singleCardItem}>
      //         {info.calloutText.split('|').map((sentence, i) => {
      //           return (
      //             <Text key={i} style={{ fontSize: 17, marginTop: 8 }}>
      //               ▪{' '}
      //               {sentence.split('::').length <= 1
      //                 ? sentence
      //                 : [
      //                     <Text style={{ fontWeight: 'bold', fontSize: 17 }}>
      //                       {sentence.split('::')[0]}:
      //                     </Text>,
      //                     <Text style={{ fontSize: 17 }}>{sentence.split('::')[1]}</Text>,
      //                   ]}
      //             </Text>
      //           );
      //         })}
      //       </CardItem>
      //     </Card>

      //     {info.calloutReferences && (
      //       <View>
      //         <Section title={'References'} />
      //         <Card style={globalStyles.card}>
      //           {info.calloutReferences.map((referenceKey, i) => (
      //             <CardItem
      //               button
      //               key={i}
      //               style={[
      //                 i === 0 && globalStyles.firstCardItemStyle,
      //                 i === info.calloutReferences.length - 1 && globalStyles.lastCardItemStyle,
      //               ]}
      //               onPress={() => {
      //                 Linking.openURL(getReference(referenceKey - 1).url);
      //               }}>
      //               <Text style={globalStyles.readableButtonTextStyle}>
      //                 {i + 1}. {getReference(referenceKey - 1).source}
      //               </Text>
      //             </CardItem>
      //           ))}
      //         </Card>
      //       </View>
      //     )}
      //   </Content>
      // </Container>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginLeft: 15,
    marginRight: 15,
    borderRadius: 8,
    paddingLeft: 0,
    paddingRight: 0,
  },
});
