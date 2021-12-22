"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLikeSearchEngine = void 0;
var findLikeSearchEngine = function (fieldName, searchText) {
    if (!searchText || !searchText.trim())
        return {};
    var searchParts = searchText.split(' ').filter(Boolean);
    return {
        $and: searchParts
            .map(function (searchPart) {
            var _a, _b;
            var isNot = searchPart[0] === '-';
            var text = isNot ? searchPart.substr(1) : searchPart;
            var comparison = {
                $regex: ".*".concat(text, ".*"),
                $options: 'i',
            };
            return isNot ? (_a = {}, _a[fieldName] = { $not: comparison }, _a) : (_b = {}, _b[fieldName] = comparison, _b);
        }),
    };
};
exports.findLikeSearchEngine = findLikeSearchEngine;
//# sourceMappingURL=findLikeSearchEngine.js.map