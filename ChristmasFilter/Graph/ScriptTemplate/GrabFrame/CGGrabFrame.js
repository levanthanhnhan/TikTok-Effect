/**
 * @file CGGrabFrame.js
 * @author
 * @date 2021/12/9
 * @brief CGGrabFrame.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');

GRAB_FRAME_OPENGLES_VS = `
#ifdef GL_ES
    precision highp float;
#endif
attribute vec3 attrPos;
attribute vec2 attrUV;
varying vec2 uv;

void main() {        
    gl_Position = vec4(attrPos.x, attrPos.y, attrPos.z, 1.0);       
    uv = attrUV;
}
`;

GRAB_FRAME_OPENGLES_FS = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D _MainTex;
varying vec2 uv;
uniform float u_x;
uniform float u_w;
uniform float u_y;
uniform float u_h;

void main() {
    vec2 uvCrop;
    uvCrop = uv;
    uvCrop.x = u_x + uvCrop.x * u_w;
    uvCrop.y = u_y + uvCrop.y * u_h;
    vec4 color = texture2D(_MainTex, uvCrop);
    gl_FragColor = color;
}
`;

GRAB_FRAME_METAL_VS = `#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float2 uv;
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 attrPos [[attribute(0)]];
    float2 attrUV [[attribute(1)]];
};

vertex main0_out main0(main0_in in [[stage_in]])
{
    main0_out out = {};
    out.gl_Position = float4(in.attrPos.x, in.attrPos.y, in.attrPos.z, 1.0);
    out.uv = in.attrUV;
    out.gl_Position.z = (out.gl_Position.z + out.gl_Position.w) * 0.5;       // Adjust clip-space for Metal
    return out;
}`;

GRAB_FRAME_METAL_FS = `
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 gl_FragColor [[color(0)]];
};

struct main0_in
{
    float2 uv;
};

fragment main0_out main0(main0_in in [[stage_in]], constant float& u_x [[buffer(0)]], constant float& u_w [[buffer(1)]], constant float& u_y [[buffer(2)]], constant float& u_h [[buffer(3)]], texture2d<float> _MainTex [[texture(0)]], sampler _MainTexSmplr [[sampler(0)]])
{
    main0_out out = {};
    float2 uvCrop = in.uv;
    uvCrop.x = u_x + (uvCrop.x * u_w);
    uvCrop.y = u_y + (uvCrop.y * u_h);
    float4 color = _MainTex.sample(_MainTexSmplr, uvCrop);
    out.gl_FragColor = color;
    return out;
}
`;

class CGGrabFrame extends BaseNode {
  constructor() {
    super();
    this.grabCommandBuffer = new Amaz.CommandBuffer();
    this.inputTexture = null;
    this.cameraList = [];
    this.cameraCount = 0;
    this.blitMaterial = null;
    this.grabTexture = null;
    this.sys = null;
    this.enable = false;
    this.cropRect = new Amaz.Rect();
  }

  createRT(width, height) {
    const rt = new Amaz.RenderTexture();
    rt.width = width;
    rt.height = height;
    rt.depth = 1;
    rt.filterMag = Amaz.FilterMode.FilterMode_LINEAR;
    rt.filterMin = Amaz.FilterMode.FilterMode_LINEAR;
    rt.filterMipmap = Amaz.FilterMipmapMode.FilterMode_NONE;
    rt.attachment = Amaz.RenderTextureAttachment.NONE;
    return rt;
  }

  addShaderToMap(shaderMap, backend, vert, frag) {
    let vs = new Amaz.Shader();
    vs.type = Amaz.ShaderType.VERTEX;
    vs.source = vert;

    let fs = new Amaz.Shader();
    fs.type = Amaz.ShaderType.FRAGMENT;
    fs.source = frag;

    let shaderVec = new Amaz.Vector();

    shaderVec.pushBack(vs);
    shaderVec.pushBack(fs);

    shaderMap.insert(backend, shaderVec);
  }

  createBlitMaterial() {
    const blitMaterial = new Amaz.Material();
    const biltXShader = new Amaz.XShader();
    const blitPass = new Amaz.Pass();

    const shaders = new Amaz.Map();

    this.addShaderToMap(shaders, 'gles2', GRAB_FRAME_OPENGLES_VS, GRAB_FRAME_OPENGLES_FS);
    this.addShaderToMap(shaders, 'metal', GRAB_FRAME_METAL_VS, GRAB_FRAME_METAL_FS);

    blitPass.shaders = shaders;
    const seman = new Amaz.Map();
    seman.insert('attrPos', Amaz.VertexAttribType.POSITION);
    seman.insert('attrUV', Amaz.VertexAttribType.TEXCOORD0);

    blitPass.semantics = seman;

    //render state
    const renderState = new Amaz.RenderState();

    //depth state
    const depthStencilState = new Amaz.DepthStencilState();
    depthStencilState.depthTestEnable = false;
    renderState.depthstencil = depthStencilState;
    blitPass.renderState = renderState;
    biltXShader.passes.pushBack(blitPass);
    blitMaterial.xshader = biltXShader;
    return blitMaterial;
  }

  beforeStart(sys) {
    this.sys = sys;
    this.blitMaterial = this.createBlitMaterial();
    const inputTexture = this.inputs[1]();
    if (inputTexture) {
      this.grabTexture = this.createRT(inputTexture.width, inputTexture.height);
    }
  }

  getOutput(index) {
    return this.grabTexture;
  }

  execute(index) {
    if (this.enable === true) {
      return;
    }
    this.enable = true;
    if (this.inputTexture === null || false === this.inputTexture.equals(this.inputs[1]())) {
      this.cameraCount = 0;
      this.inputTexture = this.inputs[1]();
      if (this.inputTexture === undefined || this.inputTexture === null) {
        return;
      }
      if (!this.sys || !this.sys.script) {
        return;
      }
      if (this.grabTexture === null) {
        this.grabTexture = this.createRT(this.inputTexture.width, this.inputTexture.height);
      }
      const entities = this.sys.scene.entities;
      this.cameraList = [];
      //todo: fix when render chain is enabled
      for (let i = 0; i < entities.size(); i++) {
        const components = entities.get(i).components;
        for (let j = 0; j < components.size(); j++) {
          if (components.get(j).isInstanceOf('Camera')) {
            if (components.get(j).renderTexture.equals(this.inputTexture)) {
              this.sys.eventListener.registerListener(
                this.sys.script,
                Amaz.CameraEvent.AFTER_RENDER,
                components.get(j),
                this.sys.script
              );
              this.cameraList.push(components.get(j));
            }
          }
        }
      }
    }
  }

  onCallBack(sys, userData, eventType) {
    if (this.enable === false) {
      return;
    }
    if (this.inputs[2]() !== null) {
      this.cropRect = this.inputs[2]();
    }
    if (eventType === Amaz.CameraEvent.AFTER_RENDER) {
      this.cameraList.forEach(camera => {
        if (camera.guid.equals(userData.guid)) {
          this.cameraCount = this.cameraCount + 1;
          // grab when the last camera finish render
          if (this.cameraCount === this.cameraList.length) {
            const cameraRT = userData.renderTexture;
            if (this.blitMaterial === null) {
              //incase blitmaterial was not created in beforeStart
              this.blitMaterial = this.createBlitMaterial();
            }
            this.blitMaterial.setFloat('u_x', this.cropRect.x);
            this.blitMaterial.setFloat('u_w', this.cropRect.width);
            this.blitMaterial.setFloat('u_y', this.cropRect.y);
            this.blitMaterial.setFloat('u_h', this.cropRect.height);
            this.grabCommandBuffer.clearAll();
            this.grabCommandBuffer.blitWithMaterial(cameraRT, this.grabTexture, this.blitMaterial);
            this.sys.scene.commitCommandBuffer(this.grabCommandBuffer);
            this.enable = false;
            this.cameraCount = 0;
            if (this.nexts[0]) {
              this.nexts[0]();
            }
          }
        }
      });
    }
  }

  resetOnRecord(sys) {
    this.grabCommandBuffer.clearAll();
    this.grabCommandBuffer.setRenderTexture(this.grabTexture);
    this.grabCommandBuffer.clearRenderTexture(true, true, new Amaz.Color(0.0, 0.0, 0.0, 0.0), 0);
    this.sys.scene.commitCommandBuffer(this.grabCommandBuffer);
    this.enable = false;
    this.blitMaterial = null;
    this.cameraCount = 0;
  }

  onDestroy() {
    this.grabCommandBuffer = null;
  }
}

exports.CGGrabFrame = CGGrabFrame;
