/**
 * @file CGAudioSpeaker.js
 * @author
 * @date 2021/11/30
 * @brief CGAudioSpeaker.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');

class CGAudioSpeaker extends BaseNode {
  constructor() {
    super();
    this.audioNode = null;
    this.audioNodeName = 'SinkNode';
    this.onlineMusicSpeaker = false;
    this.params = {};
  }

  setInput(index, func) {
    this.inputs[index] = func;
    this.params[index] = Number.MIN_VALUE;
  }

  beforeStart(sys) {
    this.updateParamsValue();
  }

  onUpdate(sys, dt) {
    this.updateParamsValue();
  }

  updateParamsValue() {
    if (!this.audioNode || !this.audioGainNode) {
      return;
    }
    const oriGain = this.params[1];
    let curGain = this.inputs[1]();
    if (oriGain !== curGain) {
      if (curGain < 0) {
        curGain = 0;
      }
      if (curGain > 100) {
        curGain = 100;
      }
      if (curGain !== oriGain) {
        this.audioGainNode.gain = curGain / 100.0;
      }
      this.params[1] = curGain;
    }
  }

  initAudio() {
    if (this.audioGraph) {
      this.audioGainNode = this.audioGraph.createAudioNode('GainNode', null);
      this.audioGainNode.gain = 1;
      this.audioNode = this.audioGainNode;
      if (this.sinkNode) {
        this.audioGainNode.connect(this.sinkNode);
        if (this.onlineMusicSpeaker === false) {
          this.audioGainNode.pout(0).connect(this.sinkNode.pin(1));
        }
      } else {
        console.error('Speaker Node connection error: can not connection to sinknode');
      }
    }
  }
}

exports.CGAudioSpeaker = CGAudioSpeaker;
