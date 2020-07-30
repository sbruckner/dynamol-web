#version 310 es
precision highp float;
precision highp int;
uniform vec2 viewportSize;
uniform sampler2D positionTexture;
uniform sampler2D normalTexture;     

struct BufferEntry
{
    float near;
    float far;
    vec3 center;
    uint id;
    uint previous;
};

layout(std430, binding = 1) buffer offsetBuffer
{
    uint count;
    uint offsets[];
};

layout(std430, binding = 2) buffer intersectionBuffer
{
    BufferEntry intersections[];
};

out vec4 fragColor;

void main(void) 
{
    /*
    int offsetIndex = int(gl_FragCoord.y)*int(viewportSize.x)+int(gl_FragCoord.x);
    uint offset = offsets[offsetIndex];

    const uint maxEntries = 128u;
    uint entryCount = 0u;
    uint indices[maxEntries];

    float minz = 100000.0;

    while (offset > 0u)
    {
        indices[entryCount++] = offset;

        if (intersections[offset].near < minz)
            minz = intersections[offset].near;

        offset = intersections[offset].previous;
    }

    if (entryCount == 0u)
        discard;                
    
    float fn = minz*0.1;
      */  
    vec4 position = texelFetch(positionTexture,ivec2(gl_FragCoord.xy),0);
    vec4 normal = texelFetch(normalTexture,ivec2(gl_FragCoord.xy),0);
    //fragColor = vec4(0.0,0.0,entryCount > 0u ? 1.0 : 0.0,1.0);//+0.5*position;
    //fragColor = vec4(0.0,0.0,float(entryCount % 256u)*0.25,1.0);//+0.5*position;
    //fragColor = vec4(fn,0.0,0.0,1.0);

    fragColor = vec4(position.xyz,1.0);
}