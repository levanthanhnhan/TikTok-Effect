'use strict';
const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
const JSAssetRuntimeManager = require('./JSAssetRuntimeManager');
class CGUserUploadedMediaInfo extends BaseNode {
  constructor() {
    super();
    this.mainObject = null;
    this.userUploadedMediaTextureAsset = null;
  }
  getOutput(index) {
    this.mainObject = this.inputs[0]();
    if (!this.mainObject) {
      return;
    }
    this.userUploadedMediaTextureAsset = JSAssetRuntimeManager.instance().getAsset(this.mainObject);
    if (!this.userUploadedMediaTextureAsset) {
      return;
    }
    switch (index) {
      case 0:
        return this.userUploadedMediaTextureAsset.index;
      case 1:
        return this.userUploadedMediaTextureAsset.isUploaded;
      case 2:
        return this.userUploadedMediaTextureAsset.imageResolution;
      default:
        return null;
    }
  }
}
exports.CGUserUploadedMediaInfo = CGUserUploadedMediaInfo;
