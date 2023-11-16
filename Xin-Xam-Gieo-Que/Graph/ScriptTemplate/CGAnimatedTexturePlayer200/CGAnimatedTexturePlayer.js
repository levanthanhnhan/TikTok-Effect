const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
const JSAssetRuntimeManager = require('./JSAssetRuntimeManager');

class CGAnimatedTexturePlayer extends BaseNode {
  constructor() {
    super();
    this.mainObject = null;
    this.animSeqAsset = null;
    this.haveRegisteredEventListener = false;
  }

  registerEventListener(sys) {
    this.mainObject = this.inputs[3]();
    if (this.mainObject) {
      Amaz.AmazingManager.addListener(
        this.mainObject,
        Amaz.AnimSequenceEventType.ANIMSEQ_PLAY_BEGIN,
        this.onPlayBegin,
        this
      );
      Amaz.AmazingManager.addListener(this.mainObject, Amaz.AnimSequenceEventType.ANIMSEQ_PAUSE, this.onPause, this);
      Amaz.AmazingManager.addListener(this.mainObject, Amaz.AnimSequenceEventType.ANIMSEQ_RESUME, this.onResume, this);
      Amaz.AmazingManager.addListener(
        this.mainObject,
        Amaz.AnimSequenceEventType.ANIMSEQ_PLAY_END,
        this.onPlayEnd,
        this
      );
      Amaz.AmazingManager.addListener(this.mainObject, Amaz.AnimSequenceEventType.ANIMSEQ_KEY_FRAME, this.onKeyFrame, this);

      const animSeqAsset = JSAssetRuntimeManager.instance().getAsset(this.mainObject);
      if (animSeqAsset) {
        this.animSeqAsset = animSeqAsset;
        const texSeq = this.animSeqAsset.textureSequence;
        this.haveRegisteredEventListener = true;
      }
    }
  }

  beforeStart(sys) {
    this.sys = sys;
    this.registerEventListener(this.sys);
  }

  onPlayBegin(userData, eventinfo, eventType) {
    if (userData.nexts[0]) {
      userData.nexts[0]();
    }
  }

  onPause(userData, eventinfo, eventType) {
    if (userData.nexts[1]) {
      userData.nexts[1]();
    }
  }

  onResume(userData, eventinfo, eventType) {
    if (userData.nexts[2]) {
      userData.nexts[2]();
    }
  }

  onPlayEnd(userData, eventinfo, eventType) {
    if (userData.nexts[3]) {
      userData.nexts[3]();
    }
  }

  onKeyFrame(userData, eventinfo, eventType) {
    if (userData.nexts[4]) {
      if (eventinfo.frameIndex == Math.round(userData.inputs[6]())) {
        userData.nexts[4]();
      }
    }
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  execute(index) {
    if (!this.haveRegisteredEventListener) {
      this.registerEventListener(this.sys);
    }

    let from = Math.max(0, Math.round(this.inputs[4]()));
    let to = Math.max(0, Math.round(this.inputs[5]()));

    if (this.animSeqAsset) {
      const frameCount = this.animSeqAsset.textureSequence.getFrameCount();
      from = this.clamp(from, 0, frameCount - 1);
      to = this.clamp(to, 0, frameCount - 1);
      if (index === 0) {
        // play
        this.animSeqAsset.resetAnim();
        this.animSeqAsset.playFromTo(from, to);
        this.animSeqAsset.play();
      } else if (index === 1) {
        // pause
        this.animSeqAsset.pause();
      } else if (index === 2) {
        // resume
        this.animSeqAsset.resume();
      }
    }
  }

  onUpdate(dt) {
    if (!this.haveRegisteredEventListener) {
      this.registerEventListener(this.sys);
    }
  }

  onDestroy(sys) {}
}

exports.CGAnimatedTexturePlayer = CGAnimatedTexturePlayer;
