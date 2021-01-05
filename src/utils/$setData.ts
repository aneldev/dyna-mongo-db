import {dynaObjectScan} from "dyna-object-scan";

export const $setData = (data: any, propertyName?: string): { [p: string]: any } => {
  const output = {};
  dynaObjectScan(data, ({path, value}) => {
    if (value === undefined) return;
    const applyPropertyName =
      propertyName
        ? propertyName + path
        : (path || '').substr(1);
    output[applyPropertyName] = value;
  });

  return output;
};
