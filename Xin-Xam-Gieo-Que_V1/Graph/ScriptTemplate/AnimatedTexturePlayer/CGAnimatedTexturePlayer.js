const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
const JSAssetRuntimeManager = require('./JSAssetRuntimeManager');
const {clamp} = require('./GraphHelper');

class CGAnimatedTexturePlayer extends BaseNode {
  constructor() {
    super();
    this.mainObject = null;
    this.animSeqAsset = null;
    this.haveRegisteredEventListener = false;
    this.listenerRegistry = []; //key: EventType  value: ArrayObj ({listener, cbFunc, userData})
  }

  registerEventListener(sys) {
    if (this.mainObject) {
      const animSeqAsset = JSAssetRuntimeManager.instance().getAsset(this.mainObject);
      if (animSeqAsset) {
        this.animSeqAsset = animSeqAsset;

        // Avoid adding listener multiple times
        if(!this.listenerRegistry.includes(this.mainObject)){
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
          Amaz.AmazingManager.addListener(
            this.mainObject,
            Amaz.AnimSequenceEventType.ANIMSEQ_KEY_FRAME,
            this.onKeyFrame,
            this
          );
          this.listenerRegistry.push(this.mainObject);
          this.haveRegisteredEventListener = true;
        }
      }
    }
  }

  beforeStart(sys) {
    this.sys = sys;
    this.mainObject = this.inputs[3]();
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
      if (eventinfo.frameIndex == Math.floor(userData.inputs[6]())) {
        userData.nexts[4]();
      }
    }
  }

  execute(index) {
    // Update the Animation Sequence Reference Evertime during runtime
    this.mainObject = this.inputs[3]();

    if(this.mainObject){
      const animSeqAsset = JSAssetRuntimeManager.instance().getAsset(this.mainObject);
      if (animSeqAsset) {
        this.animSeqAsset = animSeqAsset;
        if (!this.haveRegisteredEventListener) {
          this.registerEventListener(this.sys);
        }
    
        let from = Math.max(0, Math.floor(this.inputs[4]()));
        let to = Math.max(0, Math.floor(this.inputs[5]()));
        
        const frameCount = this.animSeqAsset.textureSequence.getFrameCount();
        from = clamp(from, 0, frameCount - 1);
        to = clamp(to, 0, frameCount - 1);
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

    if(this.nexts[0]){
      this.nexts[0]();
    }
  }

  onUpdate(dt) {
    if (!this.haveRegisteredEventListener) {
      this.registerEventListener(this.sys);
    }
  }

  resetOnRecord(sys){
    for(let animSeqObj of this.listenerRegistry){
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_PLAY_BEGIN, this.onPlayBegin, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_PAUSE, this.onPause, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_RESUME, this.onResume, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_PLAY_END, this.onPlayEnd, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_KEY_FRAME, this.onKeyFrame, this);
    }

    this.listenerRegistry = [];
    this.haveRegisteredEventListener = false;
  }

  onDestroy(sys) {
    for(let animSeqObj of this.listenerRegistry){
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_PLAY_BEGIN, this.onPlayBegin, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_PAUSE, this.onPause, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_RESUME, this.onResume, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_PLAY_END, this.onPlayEnd, this);
      Amaz.AmazingManager.removeListener(animSeqObj, Amaz.AnimSequenceEventType.ANIMSEQ_KEY_FRAME, this.onKeyFrame, this);
    }

    this.listenerRegistry = [];
    this.haveRegisteredEventListener = false;
  }
}

exports.CGAnimatedTexturePlayer = CGAnimatedTexturePlayer;
