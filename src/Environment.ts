import { Protein } from './Protein';

export const Environment = {
    settings: {
      sharpness : { 
        value : 1.0,
        min: 0.5,
        max: 16.0,
        step: 0.1
      },
      distanceBlending : { 
        value : 0.0,
        min: 0.0,
        max: 1.0,
        step: 1.0/255.0
      },
      distanceScale : { 
        value : 1.0,
        min: 0.0,
        max: 16.0,
        step: 0.1
      },
      coloring : {
        value : 0,
        items :  [
          {
            text: "None",
            value: 0
          },
          {
            text: "Element",
            value: 1
          },
          {
            text: "Residue",
            value: 2
          },
          {
            text: "Chain",
            value: 3
          }
        ]
      },      
      backgroundColor : {
        value: {
          r:0, g:0, b:0, a:1.0
        }
      },
      ambientMaterial : {
        value: {
          r:85, g:85, b:85, a:1.0
        }
      },
      diffuseMaterial : {
        value: {
          r:170, g:170, b:170, a:1.0
        }
      },     
      specularMaterial : {
        value: {
          r:85, g:85, b:85, a:1.0
        }
      },
      shininess : {
        value : 20.0,
        min: 1.0,
        max: 256.0,
        step: 0.1
      },     
      focalDistance : { 
        value : 2.0*Math.sqrt(3.0),
        min: 0.5,
        max: 16.0,
        step: 0.1
      },
      fStop : { 
        value : 5.6,
        min: 0.5,
        max: 16.0,
        step: 0.1
      },
      ambientOcclusion : {
        value: false
      },
      depthOfField : {
        value: false
      },
      environmentMapping : {
        value: false
      },
      environmentLighting : {
        value: false
      },
      materialMapping : {
        value: false
      },
      normalMapping : {
        value: false
      },
      environmentMap : {
        value : {
            id: "0",            
            src: "environments/environment0001.png"
        },
        items : [
          {
            id: "0",            
            src: "environments/environment0001.png"
          },
          {
            id: "1",            
            src: "environments/environment0002.jpg"
          }
        ]
      },
      materialMap : {
        value : {
            id: "0",
            src: "materials/material0001.png"
        },
        items : [
          {
            id: "0",            
            src: "materials/material0001.png"
          },
          {
            id: "1",            
            src: "materials/material0002.png"
          },
          {
            id: "2",            
            src: "materials/material0003.png"
          },
          {
            id: "3",            
            src: "materials/material0004.png"
          },
          {
            id: "4",            
            src: "materials/material0005.png"
          },
          {
            id: "5",            
            src: "materials/material0006.png"
          },          
          {
            id: "6",            
            src: "materials/material0007.png"
          },
          {
            id: "7",            
            src: "materials/material0008.png"
          }          
        ]
      },
      normalMap : {
        value : {
            src: "normals/normal0001.png"
        },
        items : [
          {
            id: "0",            
            src: "normals/normal0001.png"
          },
          {
            id: "1",            
            src: "normals/normal0002.png"
          },
          {
            id: "2",            
            src: "normals/normal0003.png"
          },
          {
            id: "3",            
            src: "normals/normal0004.png"
          },
          {
            id: "4",            
            src: "normals/normal0005.png"
          },
          {
            id: "5",            
            src: "normals/normal0006.png"
          },
          {
            id: "6",            
            src: "normals/normal0007.png"
          },
          {
            id: "7",            
            src: "normals/normal0008.png"
          }
        ]
      }
    },
    data : {
      loading : false,
      ready : false,
      version : 0,
      protein: new Protein(),
      _url : "",
      get url() {
        return this._url;
      },
      set url(newUrl){
        if (newUrl != this._url)
        {
          this._url = newUrl;
          this.loading = true;
          this.protein.load(newUrl).then(() => {
            console.log("done loading");
            this.version++;
            this.loading = false;
            this.ready = true;
          });
        }
      }
    }
  };
