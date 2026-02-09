//import * as Papa from "papaparse";
//import { numeric } from "../../data/csv";
import store from "../store";

/*const parsedNumeric = {};

Papa.parse(numeric, {
  header: true,
  complete(results) {
    results.data.forEach(item => (parsedNumeric[item.ID] = item));
  },
});*/
/*TODO - should be in selector.js*/
function getNumericData() {
  let { data } = store.getState().persist;
  if (!data) {
    return null;
  }
  /*let allData = {...data.numerics};
  Object.values(data).forEach(numeric => {
    allData[numeric.id] = numeric.code;
  })*/
  return data.numerics;
}

export function getKeyFromCode(code) {
  let numerics = getNumericData();
  if (!numerics) {
    return null;
  }
  for (let key in numerics) {
    if (code === numerics[key].terminology_code) {
      return key;
    }
  }
  return null;
}

export function getKeyFromId(id) {
  let numerics = getNumericData();
  if (!numerics) {
    return null;
  }
  for (let key in numerics) {
    if (id === numerics[key].id) {
      return key;
    }
  }
  return null;
}

export function getUnit(id) {
  let numerics = getNumericData();
  if (!numerics) {
    return "";
  }
  return numerics[id] ? numerics[id].unit : "";
}

export function getTitle(id) {
  let numerics = getNumericData();
  if (!numerics) {
    return "";
  }
  return numerics[id] ? numerics[id].title : "";
}

export function getHigh(id) {
  let numerics = getNumericData();
  if (!numerics) {
    return "";
  }
  return numerics[id] ? numerics[id].high : "";
}

export function getLow(id) {
  let numerics = getNumericData();
  if (!numerics) {
    return "";
  }
  return numerics[id] ? numerics[id].low : "";
}
