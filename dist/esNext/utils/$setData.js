import { dynaObjectScan } from "dyna-object-scan";
export var $setData = function (propertyName, data) {
    var output = {};
    dynaObjectScan(data, function (_a) {
        var path = _a.path, value = _a.value;
        return output[propertyName + path] = value;
    });
    return output;
};
//# sourceMappingURL=$setData.js.map