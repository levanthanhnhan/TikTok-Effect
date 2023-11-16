/**
 * @file CGSetEnable.js
 * @author liujiacheng
 * @date 2021/8/19
 * @brief CGSetEnable.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const {BaseNode} = require('./BaseNode');
const Amaz = effect.Amaz;

class CGSetEnable extends BaseNode {
  constructor() {
    super();
  }

  beforeStart(sys){
    this.sys = sys;
  }

  execute(sys, dt) {
    if (this.inputs[1] !== null && this.inputs[1] !== undefined) {
      let object = this.inputs[1]();
      let enable = this.inputs[2]();

      if (object !== null && object !== undefined && object.isInstanceOf('Component')) {
        if (
          object.isInstanceOf('FaceStretchComponent') ||
          (object.isInstanceOf('JSScriptComponent') && object.path === 'js/LutFilter.js')
        ) {
          let meshRenderer = object.entity.getComponent('MeshRenderer');

          if (meshRenderer !== null && meshRenderer !== undefined) {
            if(this.sys.autoResetEffect){
              if(this.sys.setterNodeInitValueMap && !this.sys.setterNodeGuidMap.has(meshRenderer.guid.toString())){
                const callBackFuncMap = new Map();
                callBackFuncMap.set((_meshRendererComp, _enable) => {
                  _meshRendererComp.enabled = _enable
                }, [meshRenderer.enabled && object.enabled]);
                this.sys.setterNodeGuidMap.add(meshRenderer.guid.toString());
                this.sys.setterNodeInitValueMap.set(meshRenderer.guid, callBackFuncMap);
              }
            }
            meshRenderer.enabled = enable;
          }
        } else if (object.isInstanceOf('JSScriptComponent') && object.path === 'js/FaceShapeController.js') {
          if(this.sys.autoResetEffect){
            if(this.sys.setterNodeInitValueMap && !this.sys.setterNodeGuidMap.has(object.guid.toString())){
              const callBackFuncMap = new Map();
              callBackFuncMap.set((_jssScriptComp, _enable) => _jssScriptComp.properties.set('isVisible', _enable), [object.properties.get('isVisible')]);
              this.sys.setterNodeGuidMap.add(object.guid.toString());
              this.sys.setterNodeInitValueMap.set(object.guid, callBackFuncMap);
            }
          }
          object.properties.set('isVisible', enable);
        }

        if(this.sys.autoResetEffect){
          if(this.sys.setterNodeInitValueMap && !this.sys.setterNodeGuidMap.has(object.guid.toString())){
            const callBackFuncMap = new Map();
            callBackFuncMap.set((_comp, _enable) => _comp.enabled = _enable, [object.enabled]);
            this.sys.setterNodeGuidMap.add(object.guid.toString());
            this.sys.setterNodeInitValueMap.set(object.guid, callBackFuncMap);
          }
        }
        object.enabled = enable;
        this.outputs[1] = enable;
      } else {
        this.outputs[1] = null;
      }
    }

    if (this.nexts[0]) {
      this.nexts[0]();
    }
  }
}

exports.CGSetEnable = CGSetEnable;
