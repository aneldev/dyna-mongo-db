import {dynaObjectScan} from "dyna-object-scan";

export const $setData = (propertyName: string, data: any): { [fullPathProperty: string]: any } => {
  const output = {};
  dynaObjectScan(data, ({path, value}) => output[propertyName + path] = value);
  return output;
};
