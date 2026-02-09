import { useAtomValue } from "jotai";
import { compact } from "lodash";
import { useMemo } from "react";
import { useSelector } from "../store";
import { selectedChannelAtom } from "../modals/subscribeChannelModal";
import { enabledWhitelistObj } from "../selectors";
export function useListItems(loading: boolean) {
  const listMap = useSelector(enabledWhitelistObj);
  const selectedChannelId = useAtomValue(selectedChannelAtom);
  const allChannels = useSelector((s) => s.persist.channels.allChannels);

  return useMemo(() => {
    if (selectedChannelId) {
      const whitelistObj = allChannels[selectedChannelId]?.whitelistObj || [];
      const listWTimestamps = whitelistObj.map((whitelist) =>
        listMap.get(whitelist.code)
      );
      return compact(listWTimestamps);
    }
    return Array.from(listMap.values());
  }, [selectedChannelId, loading]);
}
export function useAllItems() {
  const allData = useSelector((store) => store.persist.data);
  const lists = useListItems(true);
  return useMemo(
    () =>
      lists.map((list) => {
        switch (list.type) {
          case "calculator2":
            return allData.calculators2[list.code];
          case "module":
          default:
            return allData.modules[list.code];
        }
      }),
    [lists, allData]
  );
}
