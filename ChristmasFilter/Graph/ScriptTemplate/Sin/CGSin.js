/**
 * @file CGSin.js
 * @author liujiacheng
 * @date 2021/8/23
 * @brief CGSin.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const {BaseNode} = require('./BaseNode');
const Amaz = effect.Amaz;

class CGSin extends BaseNode {
  constructor() {
    super();
  }

  setNext(index, func) {
    this.nexts[index] = func;
  }

  setInput(index, func) {
    this.inputs[index] = func;
  }

  getOutput() {
    return Math.sin(this.inputs[0]());
  }
}

exports.CGSin = CGSin;
