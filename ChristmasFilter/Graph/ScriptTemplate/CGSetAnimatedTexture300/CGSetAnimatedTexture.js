const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
const JSAssetRuntimeManager = require('./JSAssetRuntimeManager');
const {clamp} = require('./GraphHelper');

class CGSetAnimatedTexture extends BaseNode {
  constructor() {
    super();
    this.mainObject = null;
    this.animSeqAsset = null;
    this.playModeMap = {
      'Forward': 0,
      'Ping-pong': 1,
      'Random': 2,
      'Shuffle': 3,
    };
  }

  beforeStart(sys){
    this.sys = sys;
  }

  execute() {
    this.mainObject = this.inputs[1]();
    const loopCount = this.inputs[2]();
    const playMode = this.inputs[3]();
    const fps = this.inputs[4]();
    const isReversed = this.inputs[5]();
    if (this.mainObject == null || playMode == null || fps == null || isReversed == null) {
      return;
    }

    const animSeqAsset = JSAssetRuntimeManager.instance().getAsset(this.mainObject);

    if(animSeqAsset){
      if(this.sys.autoResetEffect){
        if(this.sys.JSAssetAObjectInitValueMap && !this.sys.JSAssetAObjectGuidMap.has(this.mainObject.guid.toString())){
          const callBackFuncMap = new Map();
          callBackFuncMap.set((_jsAssetAnimSeq, _loopCount) => _jsAssetAnimSeq.loopCount = _loopCount, [animSeqAsset.loopCount]);
          callBackFuncMap.set((_jsAssetAnimSeq, _playMode) => _jsAssetAnimSeq.playMode = _playMode, [animSeqAsset.playMode]);
          callBackFuncMap.set((_jsAssetAnimSeq, _fps) => _jsAssetAnimSeq.fps = _fps, [animSeqAsset.fps]);
          callBackFuncMap.set((_jsAssetAnimSeq, _reverse) => _jsAssetAnimSeq.reverse = _reverse, [animSeqAsset.reverse]);
          this.sys.JSAssetAObjectGuidMap.add(this.mainObject.guid.toString());
          this.sys.JSAssetAObjectInitValueMap.set(this.mainObject.guid, callBackFuncMap);
        }
      }
      
      animSeqAsset.loopCount = Math.floor(clamp(loopCount, -1, 999999));
      animSeqAsset.playMode = this.playModeMap[playMode];
      animSeqAsset.fps = Math.floor(clamp(fps, 1, 9999));
      animSeqAsset.reverse = isReversed;
    }

    if (this.nexts[0]) {
      this.nexts[0]();
    }
  }

  onDestroy(sys) {}
}

exports.CGSetAnimatedTexture = CGSetAnimatedTexture;
