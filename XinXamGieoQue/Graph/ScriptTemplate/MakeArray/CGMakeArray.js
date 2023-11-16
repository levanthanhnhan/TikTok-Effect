const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');

class CGMakeArray extends BaseNode {
  constructor() {
    super();
  }

  getOutput() {
    let array = [];
    for (let i = 0; i < this.inputs.length; ++i) {
      if (this.inputs[i] === null || this.inputs[i] === undefined) {
        continue;
      }
      array.push(this.inputs[i]());
    }
    return array;
  }
}

exports.CGMakeArray = CGMakeArray;
