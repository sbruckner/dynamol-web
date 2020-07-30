#version 310 es

precision highp float;
precision highp int;
uniform vec2 viewportSize;            

layout(std430, binding = 1) buffer offsetBuffer
{
    uint count;
    uint offsets[];
};

out vec4 fragColor;

void main(void) 
{
    int offsetIndex = int(gl_FragCoord.y)*int(viewportSize.x)+int(gl_FragCoord.x);
    offsets[offsetIndex] = 0u;

    discard;
    fragColor = vec4(1.0,0.0,0.0,65535.0);
    //gl_FragDepth = 1.0;
    //gl_FragDepth = 1.0;
}