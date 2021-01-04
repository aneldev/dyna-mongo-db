"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$setData = void 0;
var dyna_object_scan_1 = require("dyna-object-scan");
exports.$setData = function (propertyName, data) {
    var output = {};
    dyna_object_scan_1.dynaObjectScan(data, function (_a) {
        var path = _a.path, value = _a.value;
        return output[propertyName + path] = value;
    });
    return output;
};
//# sourceMappingURL=$setData.js.map