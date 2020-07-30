#version 310 es            

precision highp float;
precision highp int;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 inverseModelViewProjectionMatrix;
uniform vec2 viewportSize;

flat in vec3 gSpherePosition;
flat in float gSphereRadius;
flat in uint gSphereId;

uniform sampler2D positionTexture;

out vec4 fragPosition;

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

struct Sphere
{			
    bool hit;
    vec3 near;
    vec3 far;
};
                                                                                    
Sphere calcSphereIntersection(float r, vec3 origin, vec3 center, vec3 line)
{
    vec3 oc = origin - center;
    vec3 l = normalize(line);
    float loc = dot(l, oc);
    float under_square_root = loc * loc - dot(oc, oc) + r*r;
    if (under_square_root > 0.0)
    {
        float da = -loc + sqrt(under_square_root);
        float ds = -loc - sqrt(under_square_root);
        vec3 near = origin+min(da, ds) * l;
        vec3 far = origin+max(da, ds) * l;

        return Sphere(true, near, far);
    }
    else
    {
        return Sphere(false, vec3(0), vec3(0));
    }
}
float calcDepth(vec3 pos)
{
    float far = gl_DepthRange.far; 
    float near = gl_DepthRange.near;
    vec4 clip_space_pos = modelViewProjectionMatrix * vec4(pos, 1.0);
    float ndc_depth = clip_space_pos.z / clip_space_pos.w;
    return (((far - near) * ndc_depth) + near + far) / 2.0;
}


void main()
{
    vec2 fragCoord =(2.0*gl_FragCoord.xy)/viewportSize - vec2(1.0);
    
    vec4 near = inverseModelViewProjectionMatrix*vec4(fragCoord.xy,-1.0,1.0);
    near /= near.w;

    vec4 far = inverseModelViewProjectionMatrix*vec4(fragCoord.xy,1.0,1.0);
    far /= far.w;

    vec3 V = normalize(far.xyz-near.xyz);	
    Sphere sphere = calcSphereIntersection(gSphereRadius, near.xyz, gSpherePosition.xyz, V);
    
    if (!sphere.hit)
        discard;            
    
    vec4 position = texelFetch(positionTexture,ivec2(gl_FragCoord.xy),0);
    
    BufferEntry entry;                
    entry.near = length(sphere.near.xyz-near.xyz);
    
    if (entry.near > position.w)
        discard;

    uint index = atomicAdd(count,1u);
    
    int offsetIndex = int(gl_FragCoord.y)*int(viewportSize.x)+int(gl_FragCoord.x);
    uint prev = atomicExchange(offsets[offsetIndex],index);
    //uint prev = imageAtomicExchange(offsetImage,ivec2(gl_FragCoord.xy),index);

    entry.far = length(sphere.far.xyz-near.xyz);

    entry.center = gSpherePosition.xyz;
    entry.id = gSphereId;
    entry.previous = prev;

    intersections[index] = entry;
    
    discard;

    fragPosition = vec4(0.5,0.5,0.0,1.0);              
}