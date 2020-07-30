#version 310 es

precision highp float;
precision highp int;

in vec3 positions;
    
void main(void) 
{
    gl_Position = vec4(positions,1.0);
}