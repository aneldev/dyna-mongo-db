import {dynaObjectScan} from "dyna-object-scan";
import {UpdateQuery} from "mongodb";

export const $setData = <TSchema = any, >(data: TSchema, propertyName?: string): UpdateQuery<TSchema> | Partial<TSchema> => {
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
