/**
 * @file CGAudioResourceNode.js
 * @author
 * @date 2022/1/28
 * @brief CGAudioResourceNode.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');

class CGAudioResourceNode extends BaseNode {
  constructor() {
    super();
    this.audioNode = null;
    this.audioNodeName = 'FileSourceNode';
    this.audioPath = '';
  }

  beforeStart(sys) {
    this.audioPath = this.inputs[0]();
    const path = sys.scene.assetMgr.rootDir + this.audioPath;
    if (this.audioNode) {
      this.audioNode.setSource(path);
    }
  }

  getOutput(index) {
    return this.audioNode;
  }

  initAudio() {
    if (this.audioGraph) {
      this.audioNode = this.audioGraph.createAudioNode(this.audioNodeName, null);
    }
  }
}
exports.CGAudioResourceNode = CGAudioResourceNode;
