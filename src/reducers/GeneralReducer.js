const initialState = {
  caching: {},
  modules: {},
  loadingData: false,
  deeplink: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_CACHING":
      return Object.assign(
        {},
        {
          ...state,
          caching: {
            ...state.caching,
            [action.key]: action.data,
          },
        }
      );
    case "CLEAR_CACHE":
      return Object.assign(
        {},
        {
          ...state,
          caching: initialState.caching,
        }
      );
    case "SET_GENERAL_VAR":
      return Object.assign(
        {},
        {
          ...state,
          [action.key]: action.data,
        }
      );
    case "SET_DATA_LOADING_INDICATOR":
      return Object.assign(
        {},
        {
          ...state,
          loadingData: action.data,
        }
      );
    case "SET_DEEPLINK":
      return Object.assign(
        {},
        {
          ...state,
          deeplink: action.data,
        }
      );
    default:
      return state;
  }
}
