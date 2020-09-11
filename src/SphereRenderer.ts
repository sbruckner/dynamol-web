import {Geometry} from '@luma.gl/engine';
import {Model} from '@luma.gl/engine';
import {ProgramManager} from '@luma.gl/engine';
import {setParameters} from '@luma.gl/gltools';
import {clear} from '@luma.gl/webgl';
import {Program} from '@luma.gl/webgl';
import {Texture2D} from '@luma.gl/webgl';
import {Renderbuffer} from '@luma.gl/webgl';
import {Framebuffer} from '@luma.gl/webgl';
import {VertexArray} from '@luma.gl/webgl';
import {Vector2,Vector3,Matrix3, Matrix4, radians} from 'math.gl';
import {Protein, elementColorsRadiiArray, residueColorsArray, chainColorsArray} from './Protein';
import {Accessor} from '@luma.gl/webgl';
import {Buffer} from '@luma.gl/webgl';
import {blit} from '@luma.gl/webgl';

import sphereVertexShader from './shaders/sphere-vs.glsl';
import imageVertexShader from './shaders/image-vs.glsl';
import sphereFragmentShader from './shaders/sphere-fs.glsl';
import spawnFragmentShader from './shaders/spawn-fs.glsl';
import clearFragmentShader from './shaders/clear-fs.glsl';
import surfaceFragmentShader from './shaders/surface-fs.glsl';
import shadeFragmentShader from './shaders/shade-fs.glsl';
import aoSampleFragmentShader from './shaders/aosample-fs.glsl';
import aoBlurFragmentShader from './shaders/aoblur-fs.glsl';
import debugFragmentShader from './shaders/debug-fs.glsl';

import {Viewer} from './Viewer'

export class SphereRenderer {

    private viewer;
    private viewportSize;

    private offsetBuffer;
    private intersectionBuffer;

    private sphereFramebuffer;
    private spawnFramebuffer;
    private surfaceFramebuffer;
    private aoBlurFramebuffer;
    private aoFramebuffer;

    private spherePositionTexture;
    private sphereNormalTexture;
    private sphereDiffuseTexture;
    private sphereDepthRenderbuffer;

    private surfacePositionTexture;
    private surfaceNormalTexture;
    private surfaceDiffuseTexture;
    private surfaceDepthRenderbuffer;

    private blurTexture;
    private ambientTexture;

    private elementColorsRadiiBuffer;
    private residueColorsBuffer;
    private chainColorsBuffer;

    private positionBuffer;
    private quadBuffer;
    
    private clearModel;
    private sphereModel;
    private spawnModel;
    private debugModel;
    private surfaceModel;
    private shadeModel;
    private aoSampleModel;
    private aoBlurModel;

    private version;

    constructor(gl, viewer) {
        this.viewer = viewer;
        this.version = viewer.environment.data.version;
        this.viewportSize = viewer.viewportSize();

        this.offsetBuffer = gl.createBuffer();
        gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, this.offsetBuffer);
        gl.bufferData(gl.SHADER_STORAGE_BUFFER, this.viewportSize[0]*this.viewportSize[1]*4+4,gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 1, this.offsetBuffer);

        this.intersectionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, this.intersectionBuffer);
        gl.bufferData(gl.SHADER_STORAGE_BUFFER, 1920*1280*4*128,gl.DYNAMIC_DRAW);
        gl.bindBufferBase(gl.SHADER_STORAGE_BUFFER, 2, this.intersectionBuffer);
            
        this.spherePositionTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.sphereNormalTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.sphereDiffuseTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.sphereDepthRenderbuffer =  new Renderbuffer(gl,{format: gl.DEPTH_COMPONENT32F, width: this.viewportSize[0], height: this.viewportSize[1] });
        
        this.surfacePositionTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.surfaceNormalTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.surfaceDiffuseTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.surfaceDepthRenderbuffer =  new Renderbuffer(gl,{format: gl.DEPTH_COMPONENT32F, width: this.viewportSize[0], height: this.viewportSize[1] });
        
        this.blurTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.ambientTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});

        this.sphereFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.DEPTH_ATTACHMENT]: this.sphereDepthRenderbuffer,
                [gl.COLOR_ATTACHMENT0]: this.spherePositionTexture,
                [gl.COLOR_ATTACHMENT1]: this.sphereNormalTexture
            }
        });

        this.sphereFramebuffer.checkStatus();

        this.surfaceFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.DEPTH_ATTACHMENT]: this.surfaceDepthRenderbuffer,
                [gl.COLOR_ATTACHMENT0]: this.surfacePositionTexture,
                [gl.COLOR_ATTACHMENT1]: this.surfaceNormalTexture,
                [gl.COLOR_ATTACHMENT2]: this.surfaceDiffuseTexture,
                [gl.COLOR_ATTACHMENT3]: this.sphereDiffuseTexture
            }
        });

        this.surfaceFramebuffer.checkStatus();

        this.aoBlurFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.COLOR_ATTACHMENT0]: this.blurTexture
            }
        });

        this.aoBlurFramebuffer.checkStatus();

        this.aoFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.COLOR_ATTACHMENT0]: this.ambientTexture
            }
        });

        this.aoFramebuffer.checkStatus();

        this.quadBuffer = new Buffer(gl, new Float32Array([-1.0,-1.0,0.0, 1.0,-1.0,0.0, -1.0,1.0,0.0, 1.0,1.0,0.0]));
        this.quadBuffer.accessor = new Accessor({size :3});


        this.positionBuffer = new Buffer(gl, {byteLength: 256} );//Float32Array.from({length: 2048*3}, () => 16.0*(2.0*Math.random()-1.0)));
        this.positionBuffer.accessor = new Accessor({size :4});

        this.elementColorsRadiiBuffer = new Buffer(gl,  elementColorsRadiiArray );
        this.elementColorsRadiiBuffer.bind({target: gl.UNIFORM_BUFFER, index: 0});
        
        this.residueColorsBuffer = new Buffer(gl, residueColorsArray );       
        this.residueColorsBuffer.bind({target: gl.UNIFORM_BUFFER, index: 1});

        this.chainColorsBuffer = new Buffer(gl, chainColorsArray );
        this.chainColorsBuffer.bind({target: gl.UNIFORM_BUFFER, index: 2});

        const programManager = new ProgramManager(gl);
        const shaderDefines = {};

        this.clearModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: clearFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });
               
        this.debugModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: debugFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });        

        this.sphereModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: sphereVertexShader,
            fs: sphereFragmentShader,
            attributes: {positions: this.positionBuffer},
            drawMode: gl.POINTS,
            vertexCount: this.viewer.environment.data.protein.atomCount
         });

        this.spawnModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: sphereVertexShader,
            fs: spawnFragmentShader,
            attributes: {positions: this.positionBuffer},
            drawMode: gl.POINTS,
            vertexCount: this.viewer.environment.data.protein.atomCount
        });        

        this.surfaceModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: surfaceFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });        

        this.shadeModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: shadeFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });        

        this.aoSampleModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: aoSampleFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });        

        this.aoBlurModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: aoBlurFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });

        setParameters(gl, {
            clearColor: [0, 0, 0, 1],
            clearDepth: 1,
            depthTest: true,
            depthFunc: gl.LESS
        });           
    }

    display({gl}) {
        if (!this.viewer.environment.data.ready)
            return;
        
        if (this.version != this.viewer.environment.data.version) {
            this.update(gl);
            this.version = this.viewer.environment.data.version;
        }

        if (this.viewer.environment.data.protein.atomCount == 0)
            return;

        if (!new Vector2(this.viewportSize).equals(new Vector2(this.viewer.viewportSize()))) {
            console.log(this.viewportSize);
            console.log( this.viewer.viewportSize());

            this.viewportSize = this.viewer.viewportSize();
            this.sphereFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});
            this.surfaceFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});

            gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, this.offsetBuffer);
            gl.bufferData(gl.SHADER_STORAGE_BUFFER, this.viewportSize[0]*this.viewportSize[1]*4+4,gl.DYNAMIC_DRAW);
        }


        const settings = this.viewer.environment.settings;

        const sharpness = settings.sharpness.value;
        const coloring = settings.coloring.value;
        const ambientOcclusion = settings.ambientOcclusion.value;
        const bg = settings.backgroundColor.value;
        const backgroundColor = [bg.r/255.0,bg.g/255.0,bg.b/255.0];

        let shaderDefines:any = { };

        if ( coloring > 0)
            shaderDefines.COLORING = true;

        if (ambientOcclusion)
            shaderDefines.AMBIENT = true;

        this.shadeModel.setProgram({defines:shaderDefines, vs: imageVertexShader, fs: shadeFragmentShader } );
        this.surfaceModel.setProgram({defines:shaderDefines,vs: imageVertexShader, fs: surfaceFragmentShader} );

        const modelViewMatrix = this.viewer.modelViewTransform();    
        const inverseModelViewMatrix = new Matrix4(modelViewMatrix).invert();
        const projectionMatrix = this.viewer.projectionTransform();
        const modelViewProjectionMatrix =  this.viewer.modelViewProjectionTransform();
        const inverseModelViewProjectionMatrix = new Matrix4(modelViewProjectionMatrix).invert();
        const normalMatrix = new Matrix3(new Matrix4(inverseModelViewMatrix).transpose().getRotationMatrix3());
        const inverseNormalMatrix = new Matrix3(normalMatrix).invert();
        const viewportSize = this.viewportSize;

        const modelLightMatrix = this.viewer.modelViewTransform();
        const inverseModelLightMatrix = new Matrix4(modelLightMatrix).invert();

        const worldLightPosition = inverseModelLightMatrix.transformPoint([0,0,0]);
        const viewLightPosition = modelViewMatrix.transformPoint(worldLightPosition);

        const projectionInfo= [
            -2.0 / (viewportSize[0] * projectionMatrix[0]),
		    -2.0 / (viewportSize[1] * projectionMatrix[5]),
		    (1.0 - projectionMatrix[2]) / projectionMatrix[0],
		    (1.0 + projectionMatrix[6]) / projectionMatrix[5] ];

        const projectionScale = viewportSize[1] / Math.abs(2.0 / projectionMatrix[5]);
        const fieldOfView = 2.0 * Math.atan(1.0 / projectionMatrix[5]);

        clear(gl, {color: [0, 0, 0, 1]});


        const contributingAtoms = 32.0;
        const radiusScale = Math.sqrt(Math.log(contributingAtoms*Math.exp(sharpness)) / sharpness);

        this.clearModel.setUniforms({
            viewportSize : this.viewer.viewportSize()
        });

        gl.memoryBarrier(gl.ALL_BARRIER_BITS);

        this.sphereFramebuffer.bind();
        gl.clearDepth(1.0);
        gl.clearColor(0.0,0.0,0.0,65535.0);        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.sphereFramebuffer.unbind();
                
        gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, this.offsetBuffer);
        gl.bufferSubData(gl.SHADER_STORAGE_BUFFER, 0, new Uint32Array([0]));

        gl.disable(gl.DEPTH_TEST);
        //gl.colorMask(false,false,false,false);
        gl.depthFunc(gl.ALWAYS);
        gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        this.clearModel.draw();
        //gl.colorMask(true,true,true,true);

        this.sphereModel.setUniforms({
            modelViewMatrix,
            projectionMatrix,
            modelViewProjectionMatrix,
            inverseModelViewProjectionMatrix,
            viewportSize,
            radiusScale : 1.0
        });
       
        this.sphereFramebuffer.bind();      
        gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1]);
        this.sphereFramebuffer.unbind();

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        this.sphereModel.draw({framebuffer:this.sphereFramebuffer});

        this.sphereFramebuffer.bind();      
        gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
        this.sphereFramebuffer.unbind();
        
        this.spawnModel.setUniforms({
            modelViewMatrix,
            projectionMatrix,
            modelViewProjectionMatrix,
            inverseModelViewProjectionMatrix,
            viewportSize,
            positionTexture : this.spherePositionTexture,
            radiusScale
        });
       
        gl.disable(gl.DEPTH_TEST);
        gl.depthFunc(gl.ALWAYS);
        gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        gl.colorMask(false,false,false,false);
        gl.depthMask(false);
        this.spawnModel.draw();
        gl.colorMask(true,true,true,true);
        gl.depthMask(true);

        this.surfaceModel.setUniforms({
            modelViewMatrix,
            projectionMatrix,
            modelViewProjectionMatrix,
            inverseModelViewProjectionMatrix,
            normalMatrix,
            viewportSize,
            positionTexture : this.spherePositionTexture,
            normalTexture : this.sphereNormalTexture,
            sharpness,
            coloring,
            environment : false,
            lens : false,            
            lightPosition : [0,0,0],
            diffuseMaterial : [0.5,0.5,0.5],
            ambientMaterial : [0.1,0.1,0.1],
            specularMaterial : [0.5,0.5,0.5],
            shininess : 32,
            focusPosition : [0,0]
        });

        gl.memoryBarrier(gl.ALL_BARRIER_BITS);

        this.surfaceFramebuffer.bind();
        gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1,gl.COLOR_ATTACHMENT2,gl.COLOR_ATTACHMENT3]);
        gl.clearDepth(1.0);
        gl.clearColor(0.0,0.0,0.0,65535.0);        
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.surfaceFramebuffer.unbind();


        gl.disable(gl.DEPTH_TEST);
        gl.depthFunc(gl.ALWAYS);
        //gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        this.surfaceModel.draw({framebuffer:this.surfaceFramebuffer});



        //////////////////////////////////////////////////////////////////////////
        // Ambient occlusion (optional)
        //////////////////////////////////////////////////////////////////////////
        if (ambientOcclusion)
        {
            //////////////////////////////////////////////////////////////////////////
            // Ambient occlusion sampling
            //////////////////////////////////////////////////////////////////////////

            this.aoSampleModel.setUniforms({
                projectionInfo,
                projectionScale,
                 viewLightPosition,
                surfaceNormalTexture : this.surfaceNormalTexture
            });

            this.aoSampleModel.draw({framebuffer:this.aoFramebuffer});

            //////////////////////////////////////////////////////////////////////////
            // Ambient occlusion blurring -- horizontal
            //////////////////////////////////////////////////////////////////////////
            this.aoBlurModel.setUniforms({
                normalTexture : this.surfaceNormalTexture,
                ambientTexture : this.ambientTexture,
                offset : [1.0/viewportSize[0],0.0],
                viewportSize
            });

            this.aoBlurModel.draw({framebuffer:this.aoBlurFramebuffer});


            //////////////////////////////////////////////////////////////////////////
            // Ambient occlusion blurring -- vertical
            //////////////////////////////////////////////////////////////////////////
            //m_aoFramebuffer->bind();
            //glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

            this.aoBlurModel.setUniforms({
                normalTexture : this.surfaceNormalTexture,
                ambientTexture : this.blurTexture,
                offset : [0.0,1.0/viewportSize[1]],
                viewportSize
            });

            this.aoBlurModel.draw({framebuffer:this.aoFramebuffer});
        }
        //////////////////////////////////////////////////////////////////////////

        this.shadeModel.setUniforms({
            modelViewMatrix,
            projectionMatrix,
            modelViewProjectionMatrix,
            inverseModelViewProjectionMatrix,
            normalMatrix,
            inverseNormalMatrix,
            viewportSize,
            spherePositionTexture : this.spherePositionTexture,
            sphereNormalTexture : this.sphereNormalTexture,
            sphereDiffuseTexture : this.sphereDiffuseTexture,
            surfacePositionTexture : this.surfacePositionTexture,
            surfaceNormalTexture : this.surfaceNormalTexture,
            surfaceDiffuseTexture : this.surfaceDiffuseTexture,
            ambientTexture : this.ambientTexture,
            lightPosition : worldLightPosition,
            diffuseMaterial : [0.5,0.5,0.5],
            ambientMaterial : [0.1,0.1,0.1],
            specularMaterial : [0.5,0.5,0.5],
            shininess : 32,
            backgroundColor
        });
        
        gl.depthMask(true);
        this.shadeModel.draw();
      
/*
        this.debugModel.setUniforms({
            viewportSize,
            positionTexture : this.positionTexture,
            normalTexture : this.normalTexture
        });

        gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        this.debugModel.draw();
*/   
//        blit(this.normalTexture, Framebuffer.getDefaultFramebuffer(gl));
    }

    update({gl}) {
        this.positionBuffer.setData({data:this.viewer.environment.data.protein.atomPositions});
        this.sphereModel.vertexCount = this.viewer.environment.data.protein.atomCount;
        this.spawnModel.vertexCount = this.viewer.environment.data.protein.atomCount;

//        gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, this.elementColorsRadiiBuffer);
//        gl.bufferData(gl.SHADER_STORAGE_BUFFER, this.viewer.environment.data.protein.activeElementColorsRadiiPacked,gl.DYNAMIC_DRAW);
//        this.elementColorsRadiiBuffer.setData({data:this.viewer.environment.data.protein.activeElementColorsRadiiPacked});
//        this.residueColorsBuffer.setData({data:protein.activeResidueColors});
//        this.chainColorsBuffer.setData({data:protein.activeChainColors});
    }
}

