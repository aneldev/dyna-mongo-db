import {dynaObjectScan} from "dyna-object-scan";
import {UpdateQuery} from "mongodb";

export const $setData = <TSchema = any, >(data: TSchema, propertyName?: string): UpdateQuery<TSchema> | Partial<TSchema> => {
  const output = {};
  dynaObjectScan(data, ({path, value}) => {
    if (value === undefined) return;
    if (typeof value === "object" && value !== null) return;
    if (Array.isArray(value)) return;
    const applyPropertyName =
      (
        propertyName
        ? propertyName + path
        : (path || '').substr(1)
      )
        .replace(/\[/g, '.')    // Remove [
        .replace(/\]\./g, '.')  // Remove ].
        .replace(/\]/g, '.')    // Remove ]
        .replace(/\.$/, "");    // Remove ending .
    console.debug(path, '->', applyPropertyName);
    output[applyPropertyName] = value;
  });

  return output;
};
