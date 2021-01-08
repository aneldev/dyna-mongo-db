"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$setData = void 0;
var dyna_object_scan_1 = require("dyna-object-scan");
exports.$setData = function (data, propertyName) {
    var output = {};
    dyna_object_scan_1.dynaObjectScan(data, function (_a) {
        var path = _a.path, value = _a.value, parent = _a.parent, skip = _a.skip;
        var isUndefined = value === undefined;
        if (isUndefined)
            return;
        var valueHasMongodbProperties = typeof value === "object" &&
            value !== null &&
            Object.keys(value).length &&
            Object.keys(value)
                .reduce(function (acc, key) { return acc && key[0] === '$'; }, true);
        var isRoot = parent === undefined;
        var isNull = value === null;
        var isArray = Array.isArray(value);
        var isObject = typeof value === "object" && !isNull && !isArray;
        var isObjectToOverwrite = isObject && value.__overwrite === true;
        var isArrayToOverwrite = isArray && value[value.length - 1] === '__overwrite';
        var applyPropertyName = (propertyName
            ? propertyName + path
            : (path || '').substr(1))
            .replace(/\[/g, '.') // Remove [
            .replace(/\]\./g, '.') // Remove ].
            .replace(/\]/g, '.') // Remove ]
            .replace(/\.$/, ""); // Remove ending .
        var setValue = function (value) {
            var _a;
            if (isRoot) {
                if (propertyName) {
                    output = (_a = {}, _a[propertyName] = value, _a);
                }
                else {
                    output = value;
                }
            }
            else {
                output[applyPropertyName] = value;
            }
        };
        if (valueHasMongodbProperties) {
            setValue(value);
            skip();
            return;
        }
        if (isNull) {
            setValue(value);
            return;
        }
        if (isObjectToOverwrite) {
            var applyValue = __assign({}, value);
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
//# sourceMappingURL=$setData.js.map