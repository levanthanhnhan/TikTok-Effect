'use strict';
const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
class CGImageInfo extends BaseNode {
  getOutput(index) {
    const img = this.inputs[0]();
    if (img == null) {
      return null;
    }

    switch (index) {
      case 0: //texture
        return img.texture;
      case 1: //opacity
        return img.opacity;
      case 2: //color
        return img.color;
      case 3: //size
        return img.size;
      case 4: // pivot
        return img.pivot;
      case 5: //flipX
        return img.flipX;
      case 6: //flipY
        return img.flipY;
      default:
        return null;
    }
  }
}
exports.CGImageInfo = CGImageInfo;
