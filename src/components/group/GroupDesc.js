import React from "react";
import { BubbleCard } from "../BubbleCardDashboard";
import { filterByTriggerFn } from "../../models/formula";
//import { Typography, styled } from "@material-ui/core";
//import { PAD_H, PAD_V } from "../../../constants/bubble";
import { Text } from "react-native";

export default function GroupDesc(props) {
  const { renderSection, item, variables } = props;

  const filterByTrigger = React.useCallback(
    function (item) {
      if (filterByTriggerFn(item, variables)) {
        delete variables[item.targetVariable];
        return false;
      }
      return true;
    },
    [variables]
  );
  const filteredGroupItem = React.useMemo(() => {
    const arr = item.groupItems?.filter(filterByTrigger);
    const arr2 = arr?.reduce((acc, cur, index, arr) => {
      const isLastIndex = arr.length === index + 1;
      if (isLastIndex) acc.push(cur);
      else acc.push(cur, { type: "DIVIDER", id: cur.id + "_DIVIDER" });
      return acc;
    }, []);
    return arr2;
  }, [filterByTrigger, item.groupItems]);

  if (filteredGroupItem?.length) {
    return (
      <BubbleCard item={item}>
        {item.name && <Text>{item.name}</Text>}
        {filteredGroupItem?.map((singleCard, itemKey, arr) =>
          renderSection(singleCard, itemKey, arr, {
            groupItem: true,
            variables,
          })
        )}
      </BubbleCard>
    );
  } else return null;
}
