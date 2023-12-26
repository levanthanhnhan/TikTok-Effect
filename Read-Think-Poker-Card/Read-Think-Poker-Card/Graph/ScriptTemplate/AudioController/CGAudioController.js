/**
 * @file CGAudioController.js
 * @author xuyuan
 * @date 2022/2/8
 * @brief CGAudioController.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');

class CGAudioController extends BaseNode {
  constructor() {
    super();
    this.audioNode = null;
    this.playState = 'stop';
    this.timer = 0;
    this.enable = true;
    this.loopAmount = 1;
    this.curLoop = 0;
    this.previewPaused = false;
  }
  execute(index) {
    if (this.audioNode === undefined || this.audioNode === null || this.previewPaused === true) {
      return;
    }
    if (index === 0) {
      this.audioNode.start();
      this.loopAmount = this.inputs[4]();
      this.curLoop = 0;
      if (this.nexts[1]) {
        this.nexts[1]();
      }
      this.playState = 'play';
      this.timer = 0;
    } else if (index === 1) {
      this.audioNode.stop();
      if (this.nexts[2]) {
        this.nexts[2]();
      }
      this.playState = 'stop';
      this.timer = 0;
    } else if (index === 2) {
      if (this.playState === 'stop') {
        return;
      }
      this.audioNode.pause();
      this.playState = 'pause';
    } else if (index === 3) {
      if (this.playState !== 'pause') {
        return;
      }
      this.audioNode.resume();
      this.playState = 'resume';
    }
  }

  onUpdate(sys, dt) {
    if (!this.audioNode) {
      return;
    }
    if (dt === 0 && this.previewPaused === false && (this.playState === 'play' || this.playState === 'resume')) {
      this.audioNode.pause();
      this.playState = 'pause';
      this.previewPaused = true;
    } else if (dt !== 0 && this.previewPaused === true) {
      if (this.playState === 'pause') {
        this.audioNode.resume();
        this.playState = 'resume';
      }
      this.previewPaused = false;
    }
    if (this.playState === 'play' || this.playState === 'resume') {
      if (this.enable === false || this.previewPaused === true) {
        return;
      }
      this.timer += dt * 1000;
      const duration = this.audioNode.getDuration() * 1000;
      if (this.timer >= duration && duration !== 0) {
        if (this.nexts[3]) {
          this.nexts[3]();
        }
        this.curLoop += 1;
        if (this.curLoop >= this.loopAmount) {
          if (this.audioNode) {
            this.audioNode.stop();
            this.playState = 'stop';
            this.curLoop = 0;
          }
        } else {
          if (this.audioNode) {
            this.audioNode.start();
          }
        }
        this.timer = 0;
      }
    } else if (this.playState === 'stop') {
      this.timer = 0;
    } else if (this.playState === 'pause') {
      return;
    }
  }

  onEvent(sys, event) {
    if (this.audioNode === undefined || this.audioNode === null) {
      return;
    }
    if (event.type === Amaz.AppEventType.COMPAT_BEF) {
      const event_result1 = event.args.get(0);
      // if (event_result1 === Amaz.BEFEventType.BET_RECORD_VIDEO) {
      //   const event_result2 = event.args.get(1);
      //   if (event_result2 === Amaz.BEF_RECODE_VEDIO_EVENT_CODE.RECODE_VEDIO_START) {
      //     this.enable = true;
      //     if (this.playState === 'pause') {
      //       this.audioNode.resume();
      //       this.playState = 'resume';
      //     }
      //   } else if (event_result2 === Amaz.BEF_RECODE_VEDIO_EVENT_CODE.RECODE_VEDIO_END) {
      //     this.enable = false;
      //     if (this.playState === 'play' || this.playState === 'resume') {
      //       console.log("123: pausing...")
      //       this.audioNode.pause();
      //       this.playState = 'pause';
      //     }
      //   }
      // }
    }
  }

  setInput(index, func) {
    if (index === 5 && func) {
      this.audioNode = func();
    }
    this.inputs[index] = func;
  }

  getOutput(index) {
    return this.audioNode;
  }

  resetOnRecord(sys) {
    if (this.audioNode) {
      this.audioNode.stop();
    }
    this.playState = 'stop';
    this.timer = 0;
    this.curLoop = 0;
    this.loopAmount = this.inputs[4]();
    this.previewPaused = false;
  }
}

exports.CGAudioController = CGAudioController;
