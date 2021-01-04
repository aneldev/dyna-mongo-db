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
import { ObjectId } from "mongodb";
export var saveDoc = function (item) {
    var item_ = __assign({}, item);
    if (item_.id !== undefined) {
        if (item_.id)
            item_._id = new ObjectId(item_.id);
        delete item_.id;
    }
    return item_;
};
export var loadDoc = function (item) {
    var item_ = __assign({}, item);
    item_.id = item_._id.toHexString();
    delete item_._id;
    return item_;
};
//# sourceMappingURL=saveLoadDoc.js.map