"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLikeSearchEngine = exports.$setData = exports.removeId = exports.loadDoc = exports.saveDoc = exports.DynaMongoDB = void 0;
var DynaMongoDB_1 = require("./DynaMongoDB");
Object.defineProperty(exports, "DynaMongoDB", { enumerable: true, get: function () { return DynaMongoDB_1.DynaMongoDB; } });
var saveLoadDoc_1 = require("./utils/saveLoadDoc");
Object.defineProperty(exports, "saveDoc", { enumerable: true, get: function () { return saveLoadDoc_1.saveDoc; } });
Object.defineProperty(exports, "loadDoc", { enumerable: true, get: function () { return saveLoadDoc_1.loadDoc; } });
var removeId_1 = require("./utils/removeId");
Object.defineProperty(exports, "removeId", { enumerable: true, get: function () { return removeId_1.removeId; } });
var _setData_1 = require("./utils/$setData");
Object.defineProperty(exports, "$setData", { enumerable: true, get: function () { return _setData_1.$setData; } });
var findLikeSearchEngine_1 = require("./utils/findLikeSearchEngine");
Object.defineProperty(exports, "findLikeSearchEngine", { enumerable: true, get: function () { return findLikeSearchEngine_1.findLikeSearchEngine; } });
//# sourceMappingURL=index.js.map