"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants = __importStar(require("./constants"));
const opf = __importStar(require("./opf"));
const ocf = __importStar(require("./ocf"));
const convert = __importStar(require("./convert"));
class RespecToEPUB extends convert.RespecToEPUB {
}
exports.RespecToEPUB = RespecToEPUB;
;
class OCF extends ocf.OCF {
}
exports.OCF = OCF;
;
class PackageWrapper extends opf.PackageWrapper {
}
exports.PackageWrapper = PackageWrapper;
;
exports.text_content = constants.text_content;
exports.media_types = constants.media_types;
//# sourceMappingURL=index.js.map