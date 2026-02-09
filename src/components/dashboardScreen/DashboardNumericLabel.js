import React, { Component } from "react";
// This is related to native-base. If we have to use it we should have to import it from react native
// import { Body, Card, CardItem, Input, Item, Right } from "native-base";
import {
  Text,
  View,
  Button
} from "react-native";
import * as Animatable from "react-native-animatable";
import { BubbleCard } from "../../components/BubbleCardDashboard";
import { getTitle, getUnit } from "../../models/units";

export class DashboardNumericLabel extends Component {
  constructor(props) {
    super(props);
    //this.state = { isOn: true };
  }
  render() {
    let {
      item,
      getVar,
      interactWithProtocol,
      dismissKeyboardAction,
      getInputRating,
      setVariable,
      styles,
    } = this.props;
    
    return (
      <Animatable.View animation="fadeInRight" delay={500} duration={500} key={item.id}>
        <BubbleCard isChatItem>
          <Text style={styles.titleTextStyle}>{item.title}</Text>
        </BubbleCard>
        {/* <Card style={styles.cardStyle}>
          {item.value.map(key => (
            <CardItem key={key}>
              <Body>
                <Text style={{fontWeight: "bold", fontSize: 15}}>{getTitle(key)}</Text>
                <Text style={styles.ratingTextStyle}>{getInputRating(key, getVar(key))}</Text>
              </Body>
              <Right>
                <View style={{flexDirection: "row", flexWrap: "wrap", backgroundColor: "black"}}>
                  <Item style={styles.inputStyle}>
                    <Input onSubmitEditing={() => {
                      interactWithProtocol(`numeric label input: ${getTitle(key)}`);
                      dismissKeyboardAction();
                    }}
                           onChangeText={inputValue => setVariable(key, inputValue)}
                           value={getVar(key) ? getVar(key) + "" : "N/A"}
                    />
                  </Item>
                  <Button title={getUnit(key)} bordered success onPress={() => {
                  }}>
                    <Text style={{fontSize: 8}}>{getUnit(key)}</Text>
                  </Button>
                </View>
              </Right>
            </CardItem>
          ))}
        </Card> */}
      </Animatable.View>
    );
  }
}
