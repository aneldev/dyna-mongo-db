"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$setData = exports.loadDoc = exports.saveDoc = exports.DynaMongoDB = void 0;
var DynaMongoDB_1 = require("./DynaMongoDB");
Object.defineProperty(exports, "DynaMongoDB", { enumerable: true, get: function () { return DynaMongoDB_1.DynaMongoDB; } });
var saveLoadDoc_1 = require("./utils/saveLoadDoc");
Object.defineProperty(exports, "saveDoc", { enumerable: true, get: function () { return saveLoadDoc_1.saveDoc; } });
Object.defineProperty(exports, "loadDoc", { enumerable: true, get: function () { return saveLoadDoc_1.loadDoc; } });
var _setData_1 = require("./utils/$setData");
Object.defineProperty(exports, "$setData", { enumerable: true, get: function () { return _setData_1.$setData; } });
//# sourceMappingURL=index.js.map