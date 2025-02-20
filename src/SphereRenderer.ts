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
import {loadImage} from '@loaders.gl/images';

import sphereVertexShader from './shaders/sphere-vs.glsl';
import imageVertexShader from './shaders/image-vs.glsl';
import sphereFragmentShader from './shaders/sphere-fs.glsl';
import spawnFragmentShader from './shaders/spawn-fs.glsl';
import clearFragmentShader from './shaders/clear-fs.glsl';
import surfaceFragmentShader from './shaders/surface-fs.glsl';
import shadeFragmentShader from './shaders/shade-fs.glsl';
import aoSampleFragmentShader from './shaders/aosample-fs.glsl';
import aoBlurFragmentShader from './shaders/aoblur-fs.glsl';
import dofBlurFragmentShader from './shaders/dofblur-fs.glsl';
import dofBlendFragmentShader from './shaders/dofblend-fs.glsl';

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
    private shadeFramebuffer;
    private aoBlurFramebuffer;
    private aoFramebuffer;
    private dofBlurFramebuffer;
    private dofFramebuffer;

    private colorTexture;
    private depthRenderbuffer;

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
    private dofBlurModel;
    private dofBlendModel;

    private environmentMap;
    private environmentTexture;

    private materialMap;
    private materialTexture;

    private normalMap;
    private normalTexture;

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

        this.colorTexture = new Texture2D(gl, {format: gl.RGBA32F, width: this.viewportSize[0], height: this.viewportSize[1]});
        this.depthRenderbuffer = new Renderbuffer(gl, {format: gl.DEPTH_COMPONENT32F, width: this.viewportSize[0], height: this.viewportSize[1]});
            
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

        this.shadeFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.DEPTH_ATTACHMENT]: this.depthRenderbuffer,
                [gl.COLOR_ATTACHMENT0]: this.colorTexture
            }
        });

        this.shadeFramebuffer.checkStatus();

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

        this.dofBlurFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.COLOR_ATTACHMENT0]: this.sphereNormalTexture,
                [gl.COLOR_ATTACHMENT1]: this.surfaceNormalTexture,
            }
        });

        this.dofBlurFramebuffer.checkStatus();        

        this.dofFramebuffer = new Framebuffer(gl, {
            width: this.viewportSize[0],
            height: this.viewportSize[1],
            attachments: {
                [gl.COLOR_ATTACHMENT0]: this.sphereDiffuseTexture,
                [gl.COLOR_ATTACHMENT1]: this.surfaceDiffuseTexture,
            }
        });

        this.dofFramebuffer.checkStatus();        

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

        this.dofBlurModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: dofBlurFragmentShader,
            attributes: {positions: this.quadBuffer},
            drawMode: gl.TRIANGLE_STRIP,
            vertexCount:4
        });        

        this.dofBlendModel = new Model(gl,{
            programManager,
            defines: shaderDefines,
            vs: imageVertexShader,
            fs: dofBlendFragmentShader,
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
            this.shadeFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});
            this.aoBlurFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});
            this.aoFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});
            this.dofBlurFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});
            this.dofFramebuffer.resize({width:this.viewportSize[0],height: this.viewportSize[1]});
       
            gl.bindBuffer(gl.SHADER_STORAGE_BUFFER, this.offsetBuffer);
            gl.bufferData(gl.SHADER_STORAGE_BUFFER, this.viewportSize[0]*this.viewportSize[1]*4+4,gl.DYNAMIC_DRAW);
        }

        const settings = this.viewer.environment.settings;

        if (this.environmentMap != settings.environmentMap.value)
        {
            this.environmentMap = settings.environmentMap.value;
            this.environmentTexture = new Texture2D(gl, {
                    data: loadImage(this.environmentMap.src),   
                    parameters: {
                        [gl.TEXTURE_MIN_FILTER]: gl.LINEAR_MIPMAP_LINEAR,
                        [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
                        [gl.TEXTURE_WRAP_S]:gl.REPEAT,
                        [gl.TEXTURE_WRAP_T]:gl.REPEAT,
                    },
                    pixelStore: {
                        [gl.UNPACK_FLIP_Y_WEBGL]: true,
                    },
                    mipmaps: true
                });


        }   

        if (this.materialMap != settings.materialMap.value)
        {
            this.materialMap = settings.materialMap.value;
            this.materialTexture = new Texture2D(gl, { 
                data:loadImage(this.materialMap.src),
                parameters: {
                    [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
                    [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
                    [gl.TEXTURE_WRAP_S]:gl.REPEAT,
                    [gl.TEXTURE_WRAP_T]:gl.REPEAT,
                },
                pixelStore: {
                    [gl.UNPACK_FLIP_Y_WEBGL]: true,
                },                
                mipmaps: false
            });
        }   

        if (this.normalMap != settings.normalMap.value)
        {
            this.normalMap = settings.normalMap.value;
            this.normalTexture = new Texture2D(gl, {
                data: loadImage(this.normalMap.src),
                parameters: {
                    [gl.TEXTURE_MIN_FILTER]: gl.LINEAR_MIPMAP_LINEAR,
                    [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
                    [gl.TEXTURE_WRAP_S]:gl.REPEAT,
                    [gl.TEXTURE_WRAP_T]:gl.REPEAT,
                },
                pixelStore: {
                    [gl.UNPACK_FLIP_Y_WEBGL]: true,
                },                
                mipmaps: true
        });
        }   

        const backgroundColor = [ settings.backgroundColor.value.r/255.0, settings.backgroundColor.value.g/255.0, settings.backgroundColor.value.b/255.0];
        const sharpness = settings.sharpness.value;
        const distanceBlending = settings.distanceBlending.value;
        const distanceScale = settings.distanceScale.value;
        const coloring = settings.coloring.value;

        const ambientMaterial = [ settings.ambientMaterial.value.r/255.0, settings.ambientMaterial.value.g/255.0, settings.ambientMaterial.value.b/255.0];
        const diffuseMaterial = [ settings.diffuseMaterial.value.r/255.0, settings.diffuseMaterial.value.g/255.0, settings.diffuseMaterial.value.b/255.0];
        const specularMaterial = [ settings.specularMaterial.value.r/255.0, settings.specularMaterial.value.g/255.0, settings.specularMaterial.value.b/255.0];
        const shininess = settings.shininess.value;

        const ambientOcclusion = settings.ambientOcclusion.value;
        const depthOfField = settings.depthOfField.value;
        const environmentMapping = settings.environmentMapping.value;
        const environmentLighting = settings.environmentLighting.value;
        const materialMapping = settings.materialMapping.value;
        const normalMapping = settings.normalMapping.value;

        const focalDistance = settings.focalDistance.value;
        const fStop = settings.fStop.value;

        let shaderDefines:any = { };

        if ( coloring > 0)
            shaderDefines.COLORING = true;

        if (ambientOcclusion)
            shaderDefines.AMBIENT = true;

        if (depthOfField)
            shaderDefines.DEPTHOFFIELD = true;

        if (environmentMapping)
            shaderDefines.ENVIRONMENT = true;

        if (environmentMapping && environmentLighting)
            shaderDefines.ENVIRONMENTLIGHTING = true;
    
        if (materialMapping)
            shaderDefines.MATERIAL = true;

        if (normalMapping)
            shaderDefines.NORMAL = true;

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

        const modelLightMatrix = this.viewer.modelLightTransform();
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

        const maximumCoCRadius = 9.0;
        const farRadiusRescale = 1.0;

        const focalLength = 1.0 / (Math.tan(fieldOfView * 0.5) * 2.0);
        const aparture = focalLength / fStop;

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
            radiusScale : 1.0, 
            clipRadiusScale : radiusScale
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
            radiusScale,
            clipRadiusScale : radiusScale
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
            diffuseMaterial,
            ambientMaterial,
            specularMaterial,
            shininess,
            focusPosition : [0,0],
            materialTexture : this.materialTexture,
            bumpTexture : this.normalTexture
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
            environmentTexture : this.environmentTexture,
            ambientTexture : this.ambientTexture,
            lightPosition : worldLightPosition,
            diffuseMaterial,
            ambientMaterial,
            specularMaterial,
            shininess,
            backgroundColor,
            maximumCoCRadius,
            aparture,
            focalDistance,
            focalLength,
            distanceBlending,
            distanceScale,
        });
        
        gl.depthMask(true);

        if (depthOfField)
            this.shadeModel.draw({framebuffer:this.shadeFramebuffer});
        else
            this.shadeModel.draw();

        //////////////////////////////////////////////////////////////////////////
        // Depth of field (optional)
        //////////////////////////////////////////////////////////////////////////
        if (depthOfField)
        {
            //////////////////////////////////////////////////////////////////////////
            // Depth of field blurring -- horizontal
            //////////////////////////////////////////////////////////////////////////
            
            this.dofBlurModel.setUniforms({
                maximumCoCRadius,
                aparture,
                focalDistance,
                focalLength,
                uMaxCoCRadiusPixels :  Math.round(maximumCoCRadius),
                uNearBlurRadiusPixels : Math.round(maximumCoCRadius),
                uInvNearBlurRadiusPixels :  1.0 / maximumCoCRadius,
                horizontal : true,
                nearTexture : this.colorTexture,
                blurTexture : this.colorTexture
            });

            this.dofBlurFramebuffer.bind();      
            gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1]);
            this.dofBlurFramebuffer.unbind();    
            this.dofBlurModel.draw({framebuffer:this.dofBlurFramebuffer});
            
            //////////////////////////////////////////////////////////////////////////
            // Depth of field blurring -- vertical
            //////////////////////////////////////////////////////////////////////////

            this.dofBlurModel.setUniforms({
                maximumCoCRadius,
                aparture,
                focalDistance,
                focalLength,
                uMaxCoCRadiusPixels :  Math.round(maximumCoCRadius),
                uNearBlurRadiusPixels : Math.round(maximumCoCRadius),
                uInvNearBlurRadiusPixels :  1.0 / maximumCoCRadius,
                horizontal : false,
                nearTexture : this.sphereNormalTexture,
                blurTexture : this.surfaceNormalTexture
            });

            this.dofFramebuffer.bind();      
            gl.drawBuffers([gl.COLOR_ATTACHMENT0,gl.COLOR_ATTACHMENT1]);
            this.dofFramebuffer.unbind();    
            this.dofBlurModel.draw({framebuffer:this.dofFramebuffer});

            //////////////////////////////////////////////////////////////////////////
            // Depth of field blending
            //////////////////////////////////////////////////////////////////////////

            this.dofBlendModel.setUniforms({
                maximumCoCRadius,
                aparture,
                focalDistance,
                focalLength,
                farRadiusRescale,
                colorTexture: this.colorTexture,
                nearTexture: this.sphereDiffuseTexture,
                blurTexture: this.surfaceDiffuseTexture
            });

            this.dofBlendModel.draw();
        }
	        
      
/*
        this.debugModel.setUniforms({
            viewportSize,
            positionTexture : this.positionTexture,
            normalTexture : this.normalTexture
        });

        gl.memoryBarrier(gl.ALL_BARRIER_BITS);
        this.debugModel.draw();
*/   
        //blit(this.shadeFramebuffer, Framebuffer.getDefaultFramebuffer(gl));
        /*
        this.shadeFramebuffer.bind({target:gl.READ_FRAMEBUFFER});
        Framebuffer.getDefaultFramebuffer(gl).bind({target:gl.DRAW_FRAMEBUFFER});
        gl.blitFramebuffer(0,0,viewportSize[0],viewportSize[1],0,0,viewportSize[0],viewportSize[1], gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, gl.NEAREST);
        Framebuffer.getDefaultFramebuffer(gl).unbind();
        this.shadeFramebuffer.unbind();
        */
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

