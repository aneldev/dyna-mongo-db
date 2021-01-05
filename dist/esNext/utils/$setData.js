import { dynaObjectScan } from "dyna-object-scan";
export var $setData = function (data, propertyName) {
    var output = {};
    dynaObjectScan(data, function (_a) {
        var path = _a.path, value = _a.value;
        if (value === undefined)
            return;
        var applyPropertyName = propertyName
            ? propertyName + path
            : (path || '').substr(1);
        output[applyPropertyName] = value;
    });
    return output;
};
//# sourceMappingURL=$setData.js.map