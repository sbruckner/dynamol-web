import {AnimationLoop} from '@luma.gl/engine';
import {instrumentGLContext,polyfillContext} from '@luma.gl/gltools';
import {setParameters} from '@luma.gl/gltools';
import {Vector2, Vector3, Matrix4, radians} from 'math.gl';
import {SphereRenderer} from './SphereRenderer';

export class Viewer extends AnimationLoop {
    private canvas;
    private mouse;
    private distance;
    private renderers;
    private enabled;

    private viewTransform;
    public environment;    

    constructor(canvas,environment) {
        super();
        this.canvas = canvas;
        this.environment = environment;

        this.mouse = {
            lastX: 0,
            lastY: 0
          };
      
        this.distance = 2.0*Math.sqrt(3.0);
        this.viewTransform = new Matrix4();
        this.viewTransform.lookAt([0,0,-this.distance],[0,0,0],[0,1,0]);
        this.enabled = false;

        this.initalizeEventHandling(canvas);
        
        super.start();
    }


    viewportSize() {
      return [this.canvas.width,this.canvas.height];
    }

    viewportWidth() {
      return this.canvas.width;
    }

    viewportHeight() {
      return this.canvas.height;
    }

    modelTransform() {

      const boundingBoxSize = new Vector3(this.environment.data.protein.maximumBounds).subtract(this.environment.data.protein.minimumBounds);
      const maximumSize = Math.max(boundingBoxSize.x,boundingBoxSize.y,boundingBoxSize.z);
      return new Matrix4().scale(2.0 / maximumSize).translate(new Vector3(this.environment.data.protein.minimumBounds).add(this.environment.data.protein.maximumBounds).scale(-0.5)); 
    }

    modelViewTransform() {
      
      return new Matrix4(this.viewTransform).multiplyRight(this.modelTransform());
    }

    projectionTransform() {
      const aspect = this.viewportWidth()/this.viewportHeight(); 
      return new Matrix4().perspective({fov: radians(60), aspect, near: 0.25, far: 1024.0});
    }

    modelViewProjectionTransform() {
      return new Matrix4(this.projectionTransform()).multiplyRight(this.modelViewTransform());
    }

    initalizeEventHandling(canvas) {
        let rotating = false;
        let scaling = false;
        let translating = false;
    
        const pointerDown = (x, y, button) => {
          this.mouse.lastX = x;
          this.mouse.lastY = y;
        
          if (button == 0)
            rotating = true;
          else if (button == 1)
            translating = true;
          else if (button == 2)
            scaling = true;
          
        };

        const pointerUp = (x, y, button) => {
          this.mouse.lastX = x;
          this.mouse.lastY = y;
        
          if (button == 0)
            rotating = false;
          else if (button == 1)
            translating = false;
          else if (button == 2)
            scaling = false;
        };
    
        const pointerMove = (x, y) => {
          if ([x,y] == [this.mouse.lastX,this.mouse.lastY])
            return;

          if (rotating) {
            const va = this.arcballVector(this.mouse.lastX,this.mouse.lastY);
            const vb = this.arcballVector(x,y);

            const angle = Math.acos(Math.max(-1.0,Math.min(1.0,va.dot(vb))));
            const axis = va.cross(vb);

            const inverseViewTransform = new Matrix4(this.viewTransform).invert();
            const transformedAxis = inverseViewTransform.transformDirection(axis);

            let newViewTransform = new Matrix4(this.viewTransform);
            newViewTransform.rotateAxis(angle,transformedAxis); 

            this.viewTransform = newViewTransform;
          }

          if (translating) {
            const viewportSize = this.viewportSize();
            const aspect = viewportSize[0] / viewportSize[1];
            const va = new Vector2(2.0*this.mouse.lastX / viewportSize[0] -1.0, -2.0*this.mouse.lastY / viewportSize[1] +1.0);
            const vb = new Vector2(2.0*x / viewportSize[0] -1.0, -2.0*y / viewportSize[1] +1.0);
            const d = new Vector2(vb).subtract(va);
      
            let newViewTransform = new Matrix4(this.viewTransform);
            newViewTransform.multiplyLeft(new Matrix4().translate([aspect*d.x,d.y,0.0]));
            this.viewTransform = newViewTransform;
          }

          if (scaling) {
            const viewportSize = this.viewportSize();
            const va = new Vector2(2.0*this.mouse.lastX / viewportSize[0] -1.0, -2.0*this.mouse.lastY / viewportSize[1] +1.0);
            const vb = new Vector2(2.0*x / viewportSize[0] -1.0, -2.0*y / viewportSize[1] +1.0);
            const d = new Vector2(vb).subtract(va);

            const l = Math.abs(d.x) > Math.abs(d.y) ? d.x : d.y;
            let s = 1.0;
      
            if (l > 0.0)
            {
              s += Math.min(0.5, d.magnitude());
            }
            else
            {
              s -= Math.min(0.5, d.magnitude());
            }
      
            let newViewTransform = new Matrix4(this.viewTransform);
            newViewTransform.scale(s);

            this.viewTransform = newViewTransform;
          }

          this.mouse.lastX = x;
          this.mouse.lastY = y;          
      };
        canvas.addEventListener('webglcontextlost', e => {
          this.enabled = false;
          document.body.innerHTML = "<div style='position: absolute; top: 50%; left: 50%; font-size: 24px; transform: translate(-50%,-50%); -ms-transform: translate(-50%,-50%);'><b>The WebGL context was lost.</b> This might be due to too many instances running in parallel. Try closing the browser and avoid opening the page in multipe tabs or windows at once.</div>";
        });
  
        canvas.addEventListener('wheel', e => {
          e.preventDefault();
        });
    
        canvas.addEventListener('mousedown', e => {
          let rect = this.canvas.getBoundingClientRect();
          pointerDown(e.clientX - rect.left, e.clientY - rect.top,e.button);    
          e.preventDefault();
        });
    
        window.addEventListener('mouseup', e => {
          let rect = this.canvas.getBoundingClientRect();
          pointerUp(e.clientX - rect.left, e.clientY - rect.top,e.button);    
          e.preventDefault();
        });
    
        window.addEventListener('mousemove', e => {
          let rect = this.canvas.getBoundingClientRect();
          pointerMove(e.clientX - rect.left, e.clientY - rect.top,);
          e.preventDefault();
        });
    
        window.addEventListener('contextmenu', e => {
          e.preventDefault();
        });

        canvas.addEventListener('touchstart', e => {
          pointerDown(e.touches[0].clientX, e.touches[0].clientY,0);    
          e.preventDefault();
        });
    
        canvas.addEventListener('touchmove', e => {
          pointerMove(e.touches[0].clientX, e.touches[0].clientY);
          e.preventDefault();
        });
    
        canvas.addEventListener('touchend', e => {
          if (e.touches.length === 0) {
            pointerUp(e.clientX, e.clientY,e.button);    
            e.preventDefault();
          }
        });
    }

    arcballVector(x, y) {
      const viewportSize = this.viewportSize();
      const p = new Vector3(2.0*x / viewportSize[0] -1.0, -2.0*y / viewportSize[1] +1.0, 0.0);
    
      const length2 = p[0]*p[0] + p[1]*p[1];
    
      if (length2 < 1.0)
        p.z = Math.sqrt(1.0 - length2);
      else
        p.normalize();
    
      return p;
    }
    

    onCreateContext() {
/*
        this.canvas.addEventListener("webglcontextlost", function(event) {
          event.preventDefault();
        }, false);
*/
 //       this.canvas.addEventListener(
//          "webglcontextrestored", setupWebGLStateAndResources, false);        

        let computeContext = this.canvas.getContext('webgl2-compute');

        if (computeContext != null) {
          instrumentGLContext(computeContext);
          //polyfillContext(computeContext)
          computeContext.isWebGL = function() {return true;};
          computeContext.isWebGL2 = function() {return true;};
          this.enabled = true;
        }
        else {
           document.body.innerHTML = "<div style='position: absolute; top: 50%; left: 50%; font-size: 24px; transform: translate(-50%,-50%); -ms-transform: translate(-50%,-50%);'><b>WebGL 2.0 Compute is not available.</b> Please make sure the following browser flags are set via <i>about://flags/</i> (if the flags are already set, try to close and restart your browser): <br /><br /><li><i>WebGL 2.0 Compute</i> should be set to <i>Enabled</i></li><li><i>Choose ANGLE graphics backend</i> should be set to <i>OpenGL</i></li></div>";
        }

        return computeContext;
    }
    
    onInitialize({gl}) {
        setParameters(gl, {
            clearColor: [0, 0, 0, 1],
            clearDepth: 1,
            depthTest: true,
            depthFunc: gl.LESS
        });        

        const sphereRenderer = new SphereRenderer(gl,this)
        this.renderers = [sphereRenderer];
    }
    
    onRender({gl}) {
      if (!this.enabled)
        return;

      for (const renderer of this.renderers)
        renderer.display({gl});
    }

    onContextLost(event){
      event.preventDefault();
    }
}

