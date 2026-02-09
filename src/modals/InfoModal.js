import React, { Component } from 'react';
import { Linking, View, StyleSheet, ScrollView, Image, Dimensions, Text, Button } from 'react-native';
// This is related to old design. If we need we have to redesign according to new react native components
// import { Container, Content, Card, CardItem, Icon, Grid, Col } from 'native-base';
import { getReference } from '../models/modules';
import { globalStyles } from '../components/GlobalStyles';
import { Section } from '../components/Section';

import commonImages from '../images/common/CommonImages';

/*
const CommonImages = {
  'abscess': require('./profile/abscess.jpg'),
  'furuncle': require('./profile/furuncle.jpg'),
};
*/

export class InfoModal extends Component {
  componentDidMount() {
  }
  render() {
    const { info, onClose, handleOnScroll, setScrollRef } = this.props;
    const win = Dimensions.get('window');

    if (!info) {
      return <View />;
    }

    return (
      null
      // <Container>
      //   <Content style={{ marginTop: 40, borderRadius: 8, backgroundColor: '#EEEEEE' }}>
      //     <View>
      //       <ScrollView ref={setScrollRef} onScroll={handleOnScroll} scrollEventThrottle={16}>
      //         <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'flex-end' }}>
      //           <Button transparent onPress={onClose}>
      //             <Icon type={"Ionicons"} style={{ padding: 15, fontSize: 40, color: 'black' }} name={'ios-close'} />
      //           </Button>
      //         </View>

      //         <Card style={styles.cardStyle}>
      //           <CardItem header bordered style={globalStyles.cardHeaderStyle}>
      //             <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
      //               {info.title}
      //             </Text>
      //           </CardItem>
      //           {info.imageLink && commonImages[info.imageLink] && (
      //             <View>
      //               <CardItem style={globalStyles.singleCardItem}>
      //                 <Image
      //                   style={{ width: win.width - 50, height: 400, resizeMode: 'cover' }}
      //                   source={commonImages[info.imageLink]}
      //                 />
      //               </CardItem>
      //             </View>
      //           )}
      //           <CardItem style={globalStyles.singleCardItem}>
      //             {info.calloutText.split('|').map((sentence, key) => {
      //               return (
      //                 <Text key={key} style={{ fontSize: 17, marginTop: 8, lineHeight: 26 }}>
      //                   <Text style={{ fontSize: 17, lineHeight: 26, color: '#EA8065' }}>●︎ </Text>
      //                   {sentence.split('::').length <= 1
      //                     ? sentence
      //                     : [
      //                         <Text
      //                           key={`${key}-1`}
      //                           style={{ fontWeight: 'bold', fontSize: 17, lineHeight: 26 }}>
      //                           {sentence.split('::')[0]}:
      //                         </Text>,
      //                         <Text key={`${key}-2`} style={{ fontSize: 17, lineHeight: 26 }}>
      //                           {sentence.split('::')[1]}
      //                         </Text>,
      //                       ]}
      //                 </Text>
      //               );
      //             })}
      //           </CardItem>
      //         </Card>

      //         {info.calloutReferences && (
      //           <View>
      //             <Section title={'References'} />
      //             <Card style={styles.cardStyle}>
      //               {info.calloutReferences.map((referenceKey, i) => (
      //                 <CardItem
      //                   key={i}
      //                   style={[
      //                     i === 0 && globalStyles.firstCardItemStyle,
      //                     i === info.calloutReferences.length - 1 && globalStyles.lastCardItemStyle,
      //                   ]}
      //                   button
      //                   onPress={() => {
      //                     Linking.openURL(getReference(referenceKey).url);
      //                   }}>
      //                   <Grid>
      //                     <Col>
      //                       <Text style={globalStyles.readableButtonTextStyle}>
      //                         {i + 1}. {getReference(referenceKey).source}
      //                       </Text>
      //                     </Col>
      //                     <Col style={{ marginLeft: 7, width: 15, justifyContent: 'center' }}>
      //                       <Icon type={'Ionicons'} style={{ color: 'gray' }} name="ios-chevron-forward" />
      //                     </Col>
      //                   </Grid>
      //                 </CardItem>
      //               ))}
      //             </Card>
      //           </View>
      //         )}
      //       </ScrollView>
      //     </View>
      //   </Content>
      // </Container>
    );
  }
}

const styles = StyleSheet.create({
  cardStyle: {
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 8,
    paddingLeft: 0,
    paddingRight: 0,
  },
});
