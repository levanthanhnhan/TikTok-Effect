'use strict';
const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
class CGGetComponentbyType extends BaseNode {
  constructor() {
    super();
    this.valueType = null;
  }

  execute() {
    const entity = this.inputs[1]();
    if (entity === null || entity === undefined) {
      return;
    }

    this.outputs[1] = entity.getComponent(this.valueType);

    if (this.nexts[0]) {
      this.nexts[0]();
    }
  }
}
exports.CGGetComponentbyType = CGGetComponentbyType;
