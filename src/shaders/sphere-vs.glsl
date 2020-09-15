#version 310 es

precision highp float;
precision highp int;
in vec4 positions;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 viewportSize;
uniform float radiusScale;
uniform float clipRadiusScale;

flat out vec3 gSpherePosition;
flat out float gSphereRadius;
flat out uint gSphereId;


layout(std140, binding = 0) uniform elementColorRadiusBlock
{
	vec4 elementColorsRadii[116];
};

layout(std140, binding = 1) uniform residueColorBlock
{
	vec4 residueColors[24];
};

layout(std140, binding = 2) uniform chainColorBlock
{
	vec4 chainColors[64];
};

void main(void)
{
    const float nearPlaneZ = -0.5;

	uint sphereId = floatBitsToUint(positions.w);
	uint elementId = bitfieldExtract(sphereId,0,8);
	float sphereRadius = elementColorsRadii[elementId].w*radiusScale;
    float sphereClipRadius = elementColorsRadii[elementId].w*clipRadiusScale;

   // if (elements[0].color.r > 0.0)
//        sphereRadius *= elementColorsRadii[0].w;

    vec4 center = modelViewMatrix * vec4(positions.xyz, 1.0);

	vec4 clipSize = modelViewMatrix * vec4( sphereClipRadius, 0.0,0.0,0.0);
	float clipRadius = length(clipSize);

	if (center.z + clipRadius >= nearPlaneZ)
		return;

    vec4 offset = modelViewMatrix * vec4(sphereRadius,0.0,0.0,0.0);
    float viewRadius = 0.5*length(offset.xyz);

/*    
    float d2 = dot(center,center);

    float a = sqrt(d2 - viewRadius * viewRadius);
*/
//    vec3 right = (viewRadius / a) * vec3(-center.z, 0, center.x);
//    vec3 up = vec3(0,viewRadius,0);
    vec3 right = (viewRadius) * vec3(-center.z, 0, center.x);
    vec3 up = vec3(0,viewRadius,0);

    vec4 projectedRight  = projectionMatrix * vec4(right,0);
    vec4 projectedUp     = projectionMatrix * vec4(up,0);        
    vec4 projectedCenter = projectionMatrix * center;

    vec4 north  = projectedCenter + projectedUp;
    vec4 east   = projectedCenter + projectedRight;
    vec4 south  = projectedCenter - projectedUp;
    vec4 west   = projectedCenter - projectedRight;

    north /= north.w;
    east  /= east.w;
    west  /= west.w;
    south /= south.w;

    vec3 boxMin = min(min(min(east,west),north),south).xyz;
    vec3 boxMax = max(max(max(east,west),north),south).xyz;
    vec2 boxSize = viewportSize*(boxMax.xy-boxMin.xy);

    float pointSize = 0.5*sqrt(2.0)*length(boxSize);

    //vec2 centre = (0.5 * gl_Position.xy/gl_Position.w + 0.5) * viewportSize;
    //gl_PointSize = viewportSize.y * projection[1][1] * sphereRadius / gl_Position.w;

    gl_Position = projectedCenter;
    gl_PointSize = pointSize;            

    gSpherePosition = positions.xyz;
    gSphereRadius = sphereRadius;
    gSphereId = sphereId;
}