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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynaMongoDB = void 0;
var mongodb_1 = require("mongodb");
var UpgradeCollectionsManager_1 = require("./UpgradeCollectionsManager");
var DynaMongoDB = /** @class */ (function () {
    function DynaMongoDB(config) {
        this.config = config;
        this.db = null;
        this.mongoClient = null;
        this.collectionsCache = {};
        // General tools
        this.ObjectId = mongodb_1.ObjectId;
        this.upgradeCollectionsManager = new UpgradeCollectionsManager_1.UpgradeCollectionsManager({
            dmdb: this,
            upgradeCollections: __assign({ '@@dyna-mongo-db--database': {
                    upgrades: this.config.upgradeDatabase || [],
                } }, (this.config.upgradeCollections || {})),
            onUpgradeError: this.config.onUpgradeError,
        });
    }
    // DB Connection / Disconnection
    DynaMongoDB.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, connectionString, databaseName, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this.config, connectionString = _a.connectionString, databaseName = _a.databaseName;
                        _b = this;
                        return [4 /*yield*/, mongodb_1.MongoClient.connect(encodeURI(connectionString), {
                                useNewUrlParser: true,
                                useUnifiedTopology: true,
                            })];
                    case 1:
                        _b.mongoClient = _c.sent();
                        this.db = this.mongoClient.db(databaseName);
                        return [4 /*yield*/, this.upgradeDatabase()];
                    case 2:
                        _c.sent();
                        return [2 /*return*/, this.db];
                }
            });
        });
    };
    DynaMongoDB.prototype.getDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.db)
                    return [2 /*return*/, this.db];
                return [2 /*return*/, this.connect()];
            });
        });
    };
    DynaMongoDB.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mongoClient)
                            return [2 /*return*/];
                        if (!this.db)
                            return [2 /*return*/];
                        this.collectionsCache = {};
                        return [4 /*yield*/, this.mongoClient.close()];
                    case 1:
                        _a.sent();
                        this.mongoClient = null;
                        this.db = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    DynaMongoDB.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.disconnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.connect()];
                }
            });
        });
    };
    // Collection tools
    DynaMongoDB.prototype.createCollection = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var db, collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.createCollection(collectionName)];
                    case 2:
                        collection = _a.sent();
                        return [4 /*yield*/, this.upgradeCollectionsManager.upgradeCollection(collectionName)];
                    case 3:
                        _a.sent();
                        this.collectionsCache[collectionName] = collection;
                        return [2 /*return*/, collection];
                }
            });
        });
    };
    DynaMongoDB.prototype.getCollectionNames = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                db.listCollections().toArray(function (err, collections) {
                                    if (err)
                                        reject(err);
                                    else
                                        resolve(collections
                                            .map(function (collectionInfo) { return collectionInfo.name; }));
                                });
                            })];
                }
            });
        });
    };
    DynaMongoDB.prototype.collectionExists = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var collectionNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCollectionNames()];
                    case 1:
                        collectionNames = _a.sent();
                        return [2 /*return*/, collectionNames.indexOf(collectionName) > -1];
                }
            });
        });
    };
    DynaMongoDB.prototype.getCollection = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var db, cachedCollection, collection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        cachedCollection = this.collectionsCache[collectionName];
                        if (cachedCollection)
                            return [2 /*return*/, cachedCollection];
                        return [4 /*yield*/, this.upgradeCollectionsManager.upgradeCollection(collectionName)];
                    case 2:
                        _a.sent();
                        collection = db.collection(collectionName);
                        this.collectionsCache[collectionName] = collection;
                        return [2 /*return*/, collection];
                }
            });
        });
    };
    DynaMongoDB.prototype.dropCollection = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var db, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, this.upgradeCollectionsManager.dropCollection(collectionName)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, db.dropCollection(collectionName)];
                    case 4:
                        _a.sent();
                        delete this.collectionsCache[collectionName];
                        return [2 /*return*/, true];
                    case 5:
                        e_1 = _a.sent();
                        if (e_1.name = 'MongoError' && e_1.code === 26 && e_1.message === 'ns not found')
                            return [2 /*return*/, false];
                        throw e_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DynaMongoDB.prototype.getCollectionVersion = function (collectionName) {
        return this.upgradeCollectionsManager.getCollectionVersion(collectionName);
    };
    // Upgrade methods
    DynaMongoDB.prototype.addCollectionsUpgrades = function (collectionsUpgrades) {
        this.upgradeCollectionsManager.addCollectionsUpgrades(collectionsUpgrades);
    };
    DynaMongoDB.prototype.upgradeDatabase = function () {
        return this.upgradeCollectionsManager.upgradeCollection('@@dyna-mongo-db--database');
    };
    DynaMongoDB.prototype.upgradeCollection = function (collectionName) {
        return this.upgradeCollectionsManager.upgradeCollection(collectionName);
    };
    // Document tools
    DynaMongoDB.prototype.findFirst = function (_a) {
        var collectionName = _a.collectionName, _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.sort, sort = _c === void 0 ? {} : _c;
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.find({
                            collectionName: collectionName,
                            filter: filter,
                            sort: sort,
                            limit: 1,
                        })];
                    case 1:
                        items = _d.sent();
                        return [2 /*return*/, items[0] || null];
                }
            });
        });
    };
    DynaMongoDB.prototype.find = function (_a) {
        var collectionName = _a.collectionName, _b = _a.filter, filter = _b === void 0 ? {} : _b, _c = _a.sort, sort = _c === void 0 ? {} : _c, limit = _a.limit;
        return __awaiter(this, void 0, void 0, function () {
            var collection;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName)];
                    case 1:
                        collection = _d.sent();
                        return [2 /*return*/, limit === undefined
                                ? collection.find(filter).sort(sort).toArray()
                                : collection.find(filter).sort(sort).limit(limit).toArray()];
                }
            });
        });
    };
    DynaMongoDB.prototype.explain = function (_a) {
        var _b, _c, _d, _e, _f;
        var collectionName = _a.collectionName, _g = _a.filter, filter = _g === void 0 ? {} : _g, _h = _a.sort, sort = _h === void 0 ? {} : _h, limit = _a.limit;
        return __awaiter(this, void 0, void 0, function () {
            var collection, mongoExplain;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, this.getCollection(collectionName)];
                    case 1:
                        collection = _j.sent();
                        return [4 /*yield*/, (limit === undefined
                                ? collection.find(filter).sort(sort).explain()
                                : collection.find(filter).sort(sort).limit(limit).explain())];
                    case 2:
                        mongoExplain = _j.sent();
                        return [2 /*return*/, {
                                mongoDBExplain: mongoExplain,
                                usedIndex: (_c = (_b = mongoExplain === null || mongoExplain === void 0 ? void 0 : mongoExplain.queryPlanner) === null || _b === void 0 ? void 0 : _b.winningPlan) === null || _c === void 0 ? void 0 : _c.inputStage,
                                usedIndexName: (_f = (_e = (_d = mongoExplain === null || mongoExplain === void 0 ? void 0 : mongoExplain.queryPlanner) === null || _d === void 0 ? void 0 : _d.winningPlan) === null || _e === void 0 ? void 0 : _e.inputStage) === null || _f === void 0 ? void 0 : _f.indexName,
                            }];
                }
            });
        });
    };
    DynaMongoDB.prototype._debug_changeVersion = function (collectionName, version) {
        return this.upgradeCollectionsManager._debug_changeVersion(collectionName, version);
    };
    return DynaMongoDB;
}());
exports.DynaMongoDB = DynaMongoDB;
//# sourceMappingURL=DynaMongoDB.js.map