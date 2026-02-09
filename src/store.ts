import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import reducer, { persistWhitelist, persistBlacklist } from "./reducers/index";
import * as importedSelectors from "./selectors";
import FilesystemStorage from "redux-persist-filesystem-storage";
import {
  useDispatch as UD,
  TypedUseSelectorHook,
  useSelector as US,
} from "react-redux";

const persistConfig = {
  key: "root",
  storage: FilesystemStorage,
  whitelist: Object.keys(persistWhitelist),
  blacklist: Object.keys(persistBlacklist),
};

const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer);

export const persistor = persistStore(store);
export const selectors = importedSelectors;
export const useSelector: TypedUseSelectorHook<RootState> = US;
export default store;
