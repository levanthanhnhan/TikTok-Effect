const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
const amg = require('./amg');
const JSAssetRuntimeManager = require('./JSAssetRuntimeManager');

class CGAnimatedTextureInfo extends BaseNode {
  constructor() {
    super();
    this.mainObject = null;
    this.animSeqAsset = null;
    this.playModeMap = {
      0: 'Forward',
      1: 'Ping-Pong',
      2: 'Randomize',
      3: 'Shuffle'
    }
  }

  getOutput(index){
    this.mainObject = this.inputs[0]();
    if(this.mainObject == null){
      return;
    }
    const animSeqAsset = JSAssetRuntimeManager.instance().getAsset(this.mainObject);
    if(animSeqAsset == null){
      return;
    }
    
    switch(index){
      case 0:
        return animSeqAsset.frameCount;
      case 1:
        return new Amaz.Vector2f(this.mainObject.width, this.mainObject.height);
      case 2:
        return animSeqAsset.loopCount;
      case 3:
        return this.playModeMap[animSeqAsset.playMode];
      case 4:
        return animSeqAsset.fps;
      case 5:
        return animSeqAsset.duration;
      case 6:
        return animSeqAsset.frameIndex;
      case 7:
        return animSeqAsset.reverse;
      default:
        return null;
    }
  }

  onDestroy(sys) {}
}

exports.CGAnimatedTextureInfo = CGAnimatedTextureInfo;
