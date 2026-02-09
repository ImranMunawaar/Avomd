import { createSelector } from "reselect";
import { LIVE_DB } from "./constants/strings";
import { TAG_TREE_ADMIN_ID } from "../src/utils/tags";

const dbURLSelector = (state) => state.persist.dbURL;
const channelsSelector = (state) => state.persist.channels;
const modulesSelector = (state) => state.persist.data.modules;
const dataSelector = (state) => state.persist.data;
const calculators2Selector = (state) => state.persist.data.calculators2;

const calculatorsAttachedToSelector = (state) =>
  state.general.caching.calculators;

export const isLiveSelector = createSelector([dbURLSelector], (dbURL) => {
  return dbURL === LIVE_DB;
});
export const myChannels = createSelector([channelsSelector], (channels) => {
  const channelsToReturn = [];
  for (var i = 0; i < channels.activeChannels.length; i++) {
    var singleChannel = channels.activeChannels[i];
    channelsToReturn.push(channels.allChannels[singleChannel]);
  }
  return channelsToReturn;
});

// export const enabledModules = createSelector([myChannels], (myChannels) => {
//   let enabledModules = [];

//   myChannels.forEach((channel) => {
//     if (channel && Array.isArray(channel.whiteList)) {
//       enabledModules.push(...channel.whiteList);
//     } else {
//       console.log(
//         `channel with code [${channel?.code}] does not have any module`
//       );
//     }
//   });
//   enabledModules = Array.from(new Set(enabledModules));
//   return enabledModules;
// });
export const enabledModules = createSelector([myChannels], (myChannels) => {
  const enabledModules = new Set();
  myChannels.reduce((enabledModules, channel) => {
    if (Array.isArray(channel?.whitelistObj)) {
      channel.whitelistObj
        .filter((obj) => obj?.type === "module")
        .forEach((obj) => enabledModules.add(obj.code));
    } else {
      console.log(
        `channel with code [${channel?.code}] does not have any module`
      );
    }

    return enabledModules;
  }, enabledModules);
  return Array.from(enabledModules);
});

export const enabledInstitutionalModules = createSelector(
  [myChannels],
  (myChannels) => {
    const enabledInstitutionalModules = new Set();
    myChannels?.reduce((enabledInstitutionalModules, channel) => {
      if (Array.isArray(channel?.whitelistObj) && channel?.isInstitutional) {
        channel.whitelistObj
          .filter((obj) => obj?.type === "module")
          .forEach((obj) => enabledInstitutionalModules.add(obj.code));
      }
      return enabledInstitutionalModules;
    }, enabledInstitutionalModules);
    return Array.from(enabledInstitutionalModules);
  }
);

export const enabledCalculators = createSelector(
  [myChannels, enabledModules, calculatorsAttachedToSelector],
  (myChannels, enabledModules, calculatorsAttachedToSelector) => {
    const enabledCalculators = new Set();
    myChannels?.reduce((enabledCalculators, channel) => {
      if (Array.isArray(channel?.whitelistObj)) {
        channel.whitelistObj
          .filter((obj) => obj?.type === "calculator")
          .forEach((obj) => enabledCalculators.add(obj.code));
      }
      return enabledCalculators;
    }, enabledCalculators);
    enabledModules?.reduce((enabledCalculators, module) => {
      calculatorsAttachedToSelector?.[module]?.forEach((calculator) =>
        enabledCalculators.add(calculator)
      );
      return enabledCalculators;
    }, enabledCalculators);
    return Array.from(enabledCalculators);
  }
);

export const enabledTestModules = createSelector([myChannels], (myChannels) => {
  let enabledTestModules = [];

  myChannels.forEach((channel) => {
    if (channel && channel.code === "test") {
      enabledTestModules.push(...channel.whiteList);
    }
  });
  enabledTestModules = Array.from(new Set(enabledTestModules));
  return enabledTestModules;
});

export const enabledCalculators2 = createSelector(
  [myChannels, enabledModules, modulesSelector],
  (myChannels, enabledModules, modules) => {
    const enabledCalculators2 = new Set();
    myChannels?.reduce((enabledCalculators2, channel) => {
      if (Array.isArray(channel?.whitelistObj)) {
        channel.whitelistObj
          .filter((obj) => obj?.type === "calculator2")
          .forEach((obj) => enabledCalculators2.add(obj.code));
      }
      return enabledCalculators2;
    }, enabledCalculators2);
    enabledModules?.reduce((enabledCalculators2, moduleCode) => {
      modules?.[moduleCode]?.calculators2Used?.forEach((calculator) => {
        enabledCalculators2.add(calculator);
      });
      return enabledCalculators2;
    }, enabledCalculators2);
    return Array.from(enabledCalculators2);
  }
);

export const enabledTagsTree = createSelector(
  [channelsSelector, isLiveSelector],
  (channels, isLive) => {
    const enabledTagsTree = new Set();
    // add admin team id always
    enabledTagsTree.add(
      isLive ? TAG_TREE_ADMIN_ID.PRODUCTION : TAG_TREE_ADMIN_ID.STAGING
    );
    // get active channels from the all channels list
    const reducedChannels = channels?.activeChannels.map(
      (code) => channels.allChannels[code]
    );
    // get relevant channels info optimizing it
    const relevantChannels = reducedChannels.filter((channel) =>
      channel?.whitelistObj?.some(
        (obj) => obj?.type === "module" || obj?.type === "calculator"
      )
    );
    // get teams list
    relevantChannels
      .filter((item) => item.hasOwnProperty("team"))
      .map((item) => {
        const { team } = item;
        if (team) {
          enabledTagsTree.add(team);
        }
        return team;
      });

    return Array.from(enabledTagsTree);
  }
);

export const selectorForPresistData = createSelector(
  [dataSelector],
  (dataSelector) => {
    return dataSelector;
  }
);

export const enabledWhitelistObj = createSelector(
  [myChannels],
  (myChannels) => {
    //const enabledWhitelistObj = new Map<string, WhitelistItem>();
    const enabledWhitelistObj = new Map();
    myChannels.reduce((enabledWhitelistObj, channel) => {
      if (Array.isArray(channel?.whitelistObj)) {
        channel.whitelistObj.forEach((obj) =>
          enabledWhitelistObj.set(obj.code, obj)
        );
      }
      return enabledWhitelistObj;
    }, enabledWhitelistObj);
    return enabledWhitelistObj;
  }
);
