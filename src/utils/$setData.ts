import {dynaObjectScan} from "dyna-object-scan";
import {UpdateQuery} from "mongodb";

export const $setData = <TSchema = any, >(data: TSchema, propertyName?: string): UpdateQuery<TSchema> | Partial<TSchema> => {
  let output = {};
  dynaObjectScan(data, ({path, propertyName: scanPropertyName, value, parent, skip}) => {
    const isUndefined = value === undefined;
    if (isUndefined) return;

    const isMongoDBProperty = (scanPropertyName || '')[0] === '$';
    const isRoot = parent === undefined;
    const isNull = value === null;
    const isArray = Array.isArray(value);
    const isObject = typeof value === "object" && !isNull && !isArray;

    const isObjectToOverwrite = isObject && value.__overwrite === true;
    const isArrayToOverwrite = isArray && value[value.length - 1] === '__overwrite';

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

    const setValue = (value: any): void => {
      if (isRoot) {
        if (propertyName) {
          output = {[propertyName]: value};
        }
        else {
          output = value;
        }
      }
      else {
        output[applyPropertyName] = value;
      }
    };

    if (isMongoDBProperty) {
      setValue(value);
      return;
    }

    if (isNull) {
      setValue(value);
      return;
    }

    if (isObjectToOverwrite) {
      const applyValue = {...value};
      delete applyValue.__overwrite;
      setValue(applyValue);
      skip();
      return;
    }
    if (isObject && !isArray) {
      return;
    }

    if (isArrayToOverwrite) {
      setValue(value.concat().slice(0, -1));
      skip();
      return;
    }
    if (isArray) {
      return;
    }

    setValue(value);
  });

  return output;
};
