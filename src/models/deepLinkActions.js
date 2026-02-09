import store from "../store";

export function getModuleClickParams(key, isCalculator) {
  if (!key) return;
  const persistStore = store.getState().persist;
  const module = persistStore.data.modules[key];
  const calculator = persistStore.data.calculators2[key];
  const { activeChannels, allChannels } = persistStore.channels;
  const reducedChannels = activeChannels.map((code) => allChannels[code]);
  const relChs = reducedChannels.filter((ch) => ch?.whiteList?.includes(key));
  // calculate channels for calculators
  const relevantChannels = reducedChannels.filter((channel) =>
    channel?.whitelistObj?.some(
      (obj) => obj?.type === "calculator2" && obj?.code === key
    )
  );

  if (isCalculator) {
    return {
      id: key,
      calculatorId: key,
      calculatorTitle: calculator?.title,
      channelIds: relevantChannels.map((ch) => ch.code),
      channelTitles: relevantChannels.map((ch) => ch.channelTitle),
    };
  } else {
    return {
      id: key,
      moduleId: key,
      moduleTitle: module?.title,
      channelIds: relChs.map((ch) => ch.code),
      channelTitles: relChs.map((ch) => ch.channelTitle),
    };
  }
}
