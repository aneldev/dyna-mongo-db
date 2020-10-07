"use strict";
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
exports.UpgradeCollectionsManager = void 0;
var dyna_job_queue_1 = require("dyna-job-queue");
var COLLECTION_VERSIONS_COLLECTION_NAME = 'dyna-mongo-db--upgrade-manager';
var UpgradeCollectionsManager = /** @class */ (function () {
    function UpgradeCollectionsManager(config) {
        this.config = config;
        this.dmdb = this.config.dmdb;
    }
    UpgradeCollectionsManager.prototype.upgradeCollection = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var queue, ok, error, output, asCollectionName, collectionVersion, upgradeCollection;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queue = new dyna_job_queue_1.DynaJobQueue();
                        ok = true;
                        output = {
                            initialVersion: null,
                            upgradeToVersion: null,
                            hasUpgrades: null,
                            plannedUpgrades: 0,
                            appliedUpgrades: 0,
                        };
                        asCollectionName = collectionName.includes('---')
                            ? collectionName.split('---')[1]
                            : collectionName;
                        return [4 /*yield*/, this.getCollectionVersion(collectionName)];
                    case 1:
                        collectionVersion = _a.sent();
                        output.initialVersion = collectionVersion === -2 ? null : collectionVersion;
                        upgradeCollection = this.config.upgradeCollections[asCollectionName];
                        output.hasUpgrades = !!upgradeCollection;
                        if (!upgradeCollection)
                            return [2 /*return*/, output];
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var collectionMissingVersions = upgradeCollection.upgrades
                                    .sort(function (a, b) { return a.version - b.version; })
                                    .filter(function (upgradeCollection) { return upgradeCollection.version > collectionVersion; });
                                collectionMissingVersions.forEach(function (upgrade) {
                                    output.upgradeToVersion = upgrade.version;
                                    output.plannedUpgrades++;
                                    queue.addJobPromised(function () { return __awaiter(_this, void 0, void 0, function () {
                                        var e_1;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!ok)
                                                        return [2 /*return*/];
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, this.checkAndUpgradeCollection(collectionName, upgrade)];
                                                case 2:
                                                    _a.sent();
                                                    output.appliedUpgrades++;
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    e_1 = _a.sent();
                                                    ok = false;
                                                    error = e_1;
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                });
                                queue.addJobPromised(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        if (ok)
                                            resolve(output);
                                        reject(error);
                                        return [2 /*return*/];
                                    });
                                }); });
                            })];
                }
            });
        });
    };
    UpgradeCollectionsManager.prototype.checkAndUpgradeCollection = function (collectionName, upgrade) {
        return __awaiter(this, void 0, void 0, function () {
            var db, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("DynaMongoDB: Upgrade collection \"" + collectionName + "\" to version " + upgrade.version + " " + upgrade.title);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.dmdb.getDb()];
                    case 2:
                        db = _a.sent();
                        return [4 /*yield*/, upgrade.method({
                                db: db,
                                collectionName: collectionName,
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.bumpConnectionCurrentVersion(collectionName, upgrade.version)];
                    case 4:
                        _a.sent();
                        console.log("DynaMongoDB:  SUCCESS upgrade for collection \"" + collectionName + "\" to version " + upgrade.version);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error("DynaMongoDB:  FAILED upgrade for collection \"" + collectionName + "\" to version " + upgrade.version, error_1);
                        if (this.config.onUpgradeError)
                            this.config.onUpgradeError(collectionName, upgrade.version, error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UpgradeCollectionsManager.prototype.getCollectionVersion = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var db, versionCollection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dmdb.getDb()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db
                                .collection(COLLECTION_VERSIONS_COLLECTION_NAME)
                                .findOne({ collectionName: collectionName })];
                    case 2:
                        versionCollection = _a.sent();
                        if (versionCollection)
                            return [2 /*return*/, versionCollection.version];
                        return [2 /*return*/, -2];
                }
            });
        });
    };
    UpgradeCollectionsManager.prototype.getVersionsCollectionCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, versionsCollectionsCollection, collectionExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dmdb.getDb()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, this.dmdb.collectionExists(COLLECTION_VERSIONS_COLLECTION_NAME)];
                    case 2:
                        collectionExists = _a.sent();
                        if (!collectionExists) return [3 /*break*/, 4];
                        return [4 /*yield*/, db.collection(COLLECTION_VERSIONS_COLLECTION_NAME)];
                    case 3:
                        // load
                        versionsCollectionsCollection = _a.sent();
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, db.createCollection(COLLECTION_VERSIONS_COLLECTION_NAME)];
                    case 5:
                        // create
                        versionsCollectionsCollection = _a.sent();
                        return [4 /*yield*/, versionsCollectionsCollection.createIndex({
                                collectionName: 1,
                            }, {
                                name: 'Collection name index',
                                unique: true,
                            })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/, versionsCollectionsCollection];
                }
            });
        });
    };
    UpgradeCollectionsManager.prototype.bumpConnectionCurrentVersion = function (collectionName, toVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var versionsCollectionsCollection, updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVersionsCollectionCollection()];
                    case 1:
                        versionsCollectionsCollection = _a.sent();
                        return [4 /*yield*/, versionsCollectionsCollection
                                .updateOne({
                                collectionName: collectionName,
                            }, {
                                $set: {
                                    version: toVersion,
                                },
                            }, {
                                upsert: true,
                            })];
                    case 2:
                        updateResult = _a.sent();
                        if (updateResult.upsertedCount === 0 && updateResult.modifiedCount === 0) {
                            throw {
                                message: "Cannot update version info collection for collection [" + collectionName + "] v" + toVersion,
                                data: { collectionName: collectionName, updateResult: updateResult },
                            };
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UpgradeCollectionsManager.prototype.dropCollection = function (collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var versionsCollectionsCollection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVersionsCollectionCollection()];
                    case 1:
                        versionsCollectionsCollection = _a.sent();
                        return [4 /*yield*/, versionsCollectionsCollection
                                .deleteOne({
                                collectionName: collectionName,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    UpgradeCollectionsManager.prototype._debug_changeVersion = function (collectionName, version) {
        return __awaiter(this, void 0, void 0, function () {
            var versionsCollection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVersionsCollectionCollection()];
                    case 1:
                        versionsCollection = _a.sent();
                        return [4 /*yield*/, versionsCollection.updateOne({
                                collectionName: collectionName,
                            }, {
                                $set: { version: version },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return UpgradeCollectionsManager;
}());
exports.UpgradeCollectionsManager = UpgradeCollectionsManager;
//# sourceMappingURL=UpgradeCollectionsManager.js.map