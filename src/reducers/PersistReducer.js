import _ from "lodash";
import { LIVE_DB } from "../constants/strings";
//import { commitNumber } from '../commitInfo';

const initialState = {
  data: {
    modules: {},
    calculators: {},
    calculators2: {},
    activeCalculator: {},
    activeModule: {},
    allModules: {},
    numerics: {},
    teams: {},
    tagTrees2: {},
  },
  loadedData: {},
  activeReleaseTarget: "",
  channels: {
    activeChannels: [],
    allChannels: {},
  },
  searchHistory: [],
  heartFlowLink: false,
  dbURL: LIVE_DB,
  isUserLoggedIn: false,
};

export default function reducer(state = initialState, action) {
  let data, loadedData;
  switch (action.type) {
    case "RESET_ALL_DATA":
      return Object.assign(
        {},
        {
          ...state,
          data: initialState.data,
          loadedData: initialState.loadedData,
          activeReleaseTarget: initialState.activeReleaseTarget,
          channels: initialState.channels,
          heartFlowLink: initialState.heartFlowLink,
        }
      );
    case "RESET_DATA":
      return Object.assign(
        {},
        {
          ...state,
          data: initialState.data,
          //commitNumber,
        }
      );
    case "SWITCH_DB":
      return Object.assign(
        {},
        {
          ...state,
          dbURL: action.dbURL,
        }
      );
    case "SET_ACTIVE_MODULE":
      return {
        ...state,
        data: {
          ...state.data,
          activeModule: action?.activeModule || {},
        },
      };
    case "SET_ACTIVE_CALCULATOR":
      return {
        ...state,
        data: {
          ...state.data,
          activeCalculator: action.activeCalculator || {},
        },
      };
    case "SET_SEARCH_HISTORY":
      return {
        ...state,
        searchHistory: action.searchHistoryList,
      };
    case "RESET_LOADED_MODULES":
      return Object.assign(
        {},
        {
          ...state,
          loadedData: {},
        }
      );
    case "SET_RELEASE_TARGET":
      return Object.assign(
        {},
        {
          ...state,
          activeReleaseTarget: action.data,
        }
      );
    case "SET_CHANNELS":
      return Object.assign(
        {},
        {
          ...state,
          channels: {
            ...state.channels,
            [action.channelName]: action.data,
          },
        }
      );
    case "SET_DATA_LOADED":
      loadedData = Object.assign({}, state.loadedData, {
        [action.name]: action.data,
      });
      //loadedData[action.name] = action.data;
      return Object.assign(
        {},
        {
          ...state,
          loadedData,
        }
      );
    case "SET_DATA":
      data = Object.assign({}, state.data);
      loadedData = state.loadedData;
      if (!data[action.dataKey]) {
        data[action.dataKey] = {};
      }
      if (!_.isNil(action.key)) {
        if (!_.isNil(action.data))
          data[action.dataKey][action.key] = action.data;
        loadedData = Object.assign({}, state.loadedData, {
          [action.key]: true,
        });
      } else {
        data[action.dataKey] = action.data;
        loadedData = Object.assign({}, state.loadedData, {
          [action.dataKey]: true,
        });
      }
      return Object.assign(
        {},
        {
          ...state,
          data,
          loadedData,
        }
      );
    case "SET_HEART_FLOW_LINK":
      return Object.assign(
        {},
        {
          ...state,
          heartFlowLink: action.data,
        }
      );
    case "SET_IS_USER_LOGGED_IN":
      return Object.assign(
        {},
        {
          ...state,
          isUserLoggedIn: action.data,
        }
      );
    default:
      return state;
  }
}
