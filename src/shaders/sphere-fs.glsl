#version 310 es

precision highp float;
precision highp int;
uniform mat4 modelViewProjectionMatrix;
uniform mat4 inverseModelViewProjectionMatrix;
uniform vec2 viewportSize;

flat in vec3 gSpherePosition;
flat in float gSphereRadius;
flat in uint gSphereId;

layout(location = 0) out vec4 fragPosition;
layout(location = 1) out vec4 fragNormal;

struct Sphere
{			
    bool hit;
    vec3 near;
    vec3 far;
    vec3 normal;
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
        vec3 normal = (near - center);

        return Sphere(true, near, far, normal);
    }
    else
    {
        return Sphere(false, vec3(0), vec3(0), vec3(0));
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

    fragPosition = vec4(sphere.near.xyz,length(sphere.near.xyz-near.xyz));   
 
 //   fragPosition = vec4(1.0,abs(dot(sphere.normal,vec3(0.0,0.0,1.0))),0.0,1.0);//vec4(sphere.near.xyz,length(sphere.near.xyz-near.xyz));   
    fragNormal = vec4(sphere.normal,uintBitsToFloat(gSphereId));
    
    float depth = calcDepth(sphere.near.xyz);
    gl_FragDepth = depth;
}
