import React, { Component } from "react";
import Design from "./design";
import { connect } from "react-redux";
import { selectors } from "../../store";
import {
  initModules,
  isValid,
  setDefaultStorage,
  setActiveModule,
} from "../../models/modules";
import * as Analytics from "../../services/Analytics";

class PreOpModuleScreen extends Component {
  state = { modulesLoading: false };

  componentDidMount() {
    if (this.props.activeChannels.length === 0) {
      this.subscribeChannels(["preop"]);
    }
  }

  setSearchInputRef = (ref) => {
    if (ref) this.searchInputRef = ref._root;
  };

  onSearchText = (text) => {
    this.setState({ keyword: text });
  };

  clearSearch = () => {
    this.searchInputRef.clear();
    this.setState({ keyword: null });
  };

  _loadModules = async () => {
    this.setState({ modulesLoading: true });
    await setDefaultStorage();
    await initModules();
    this.setState({
      modulesLoading: false,
    });
    const { activeChannels } = this.props;
    Analytics.identify(this.user.email, {
      "active channels": activeChannels,
    });
  };

  async subscribeChannels(channels) {
    this.props.dispatch({
      type: "SET_CHANNELS",
      channelName: "activeChannels",
      data: channels,
    });
    initModules();

    const { activeChannels } = this.props;
    Analytics.identify(this.user.email, {
      "active channels": activeChannels,
    });
  }

  gotoModule = (key) => {
    const allModuleCodes = Object.keys(this.props.modules);
    //console.log(`MODULE ${key} of ${allModuleCodes.length}`);
    //console.log("MODULES", allModuleCodes.length);
    if (allModuleCodes.includes(key)) {
      this.targetModule = null;
      setActiveModule(key);
      this.props.navigation.navigate("Dashboard");
    }
  };

  getLoadingText = () => {
    const { loadedData } = this.props;
    const loadedDataCount = Object.keys(loadedData).filter(
      (key) => loadedData[key] === true
    ).length;
    const totalDataCount = Object.keys(loadedData).length;
    const remainingData = Object.keys(loadedData).filter(
      (key) => loadedData[key] !== true
    );
    const loadingPercentage = Math.round(
      (loadedDataCount / totalDataCount) * 100
    );
    const modulesText =
      remainingData.length > 0 ? `\n\n${remainingData.join("\n")}` : "";
    return totalDataCount === 0
      ? "Checking for updates..."
      : `Loading: ${loadingPercentage} %${modulesText}`;
  };

  _matchTextToKeyword(text) {
    if (this.state.keyword) {
      return text.toLowerCase().includes(this.state.keyword.toLowerCase());
    } else {
      return true;
    }
  }

  render() {
    return <Design _this={this} />;
  }
}

export default connect((state) => ({
  enabledModules: selectors.enabledModules(state),
  modules: state.persist.data.modules,
  loadedData: state.persist.loadedData,
  loadingData: state.general.loadingData,
  drawer: state.general.drawer,
  activeChannels: state.persist.channels.activeChannels,
  allChannels: state.persist.channels.allChannels,
}))(PreOpModuleScreen);
