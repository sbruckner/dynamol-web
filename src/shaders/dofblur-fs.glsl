#version 310 es

// This is an implementation of the depth-of-field method by McGuire.
// It is based on the source code available at the link below, with only slight adaptations.
// 
// Morgan McGuire. The Skylanders SWAP Force Depth-of-Field Shader.
// http://casual-effects.blogspot.com/2013/09/the-skylanders-swap-force-depth-of.html

#define saturate(s) clamp( s, 0.0, 1.0 )

uniform sampler2D blurTexture;
uniform sampler2D nearTexture;

uniform float maximumCoCRadius;
uniform float aparture;
uniform float focalDistance;
uniform float focalLength;

uniform int       uMaxCoCRadiusPixels;
uniform int       uNearBlurRadiusPixels;
uniform float     uInvNearBlurRadiusPixels;

uniform bool	horizontal;

layout(location = 0) out vec4 nearResult;
layout(location = 1) out vec4 blurResult;

bool inNearField(in float radiusPixels)
{
	return radiusPixels > 0.25;
}

void main(void)
{
	ivec2 kDirection = ivec2(0, 1);
	if (horizontal)
	{
		kDirection = ivec2(1, 0);
	}

	const int KERNEL_TAPS = 6;
	float kernel[KERNEL_TAPS + 1];

	// 11 x 11 separated kernel weights.  This does not dictate the 
	// blur kernel for depth of field; it is scaled to the actual
	// kernel at each pixel.
	//   Custom disk-like // vs. Gaussian
	/*
	kernel[6] = 0.00;     // 0.00000000000000;  // Weight applied to outside-radius values
	kernel[5] = 0.50;     // 0.04153263993208;
	kernel[4] = 0.60;     // 0.06352050813141;
	kernel[3] = 0.75;     // 0.08822292796029;
	kernel[2] = 0.90;     // 0.11143948794984;
	kernel[1] = 1.00;     // 0.12815541114232;
	kernel[0] = 1.00;     // 0.13425804976814;
	*/
	
	kernel[6] = 0.00000000000000;  // Weight applied to outside-radius values
	kernel[5] = 0.04153263993208;
	kernel[4] = 0.06352050813141;
	kernel[3] = 0.08822292796029;
	kernel[2] = 0.11143948794984;
	kernel[1] = 0.12815541114232;
	kernel[0] = 0.13425804976814;
						  // Accumulate the blurry image color
	blurResult.rgb = vec3(0.0);
	float blurWeightSum = 0.0;

	// Accumulate the near-field color and coverage
	nearResult = vec4(0.0);
	float nearWeightSum = 0.0;

	// Location of the central filter tap (i.e., "this" pixel's location) 
	// Account for the scaling down to 25% of original dimensions during blur
	ivec2 A = ivec2(gl_FragCoord.xy);// * (kDirection * 3 + ivec2(1)));

	float packedA = texelFetch(blurTexture, A, 0).a;
	//float pa = packedA;

	//packedA = maximumCoCRadius * aparture * (focalLength * (focalDistance - packedA)) / (packedA * (focalDistance - focalLength));
	//float r_A = packedA * uMaxCoCRadiusPixels;

	float r_A = (packedA * 2.0 - 1.0) * float(uMaxCoCRadiusPixels);

	// Map r_A << 0 to 0, r_A >> 0 to 1
	float nearFieldness_A = saturate(r_A * 4.0);

	for (int delta = -uMaxCoCRadiusPixels; delta <= uMaxCoCRadiusPixels; ++delta)
	{
		// Tap location near A
		//vec2   B = vec2(A)+vec2(0.5,0.5) + vec2(kDirection * delta);
		//B /= vec2( textureSize(blurTexture, 0));
		ivec2   B = A + (kDirection * delta);

		// Packed values
		vec4 blurInput = texelFetch(blurTexture, clamp(B, ivec2(0), textureSize(blurTexture, 0) - ivec2(1)), 0);
		//vec4 blurInput = texture(blurTexture, B);

		// Signed kernel radius at this tap, in pixels
		float r_B = (blurInput.a * 2.0 - 1.0) * float(uMaxCoCRadiusPixels);
		//blurInput.a = maximumCoCRadius * aparture * (focalLength * (focalDistance - blurInput.a)) / (blurInput.a * (focalDistance - focalLength));
		//float r_B = blurInput.a * float(uMaxCoCRadiusPixels);

		/////////////////////////////////////////////////////////////////////////////////////////////
		// Compute blurry buffer

		float weight = 0.0;

		float wNormal =
			// Only consider mid- or background pixels (allows inpainting of the near-field)
			float(!inNearField(r_B)) *

			// Only blur B over A if B is closer to the viewer (allow 0.5 pixels of slop, and smooth the transition)
			// This term avoids "glowy" background objects but leads to aliasing under 4x downsampling
			// saturate( abs( r_A ) - abs( r_B ) + 1.5 ) *

			// Stretch the kernel extent to the radius at pixel B.
			kernel[clamp(int(float(abs(delta) * (KERNEL_TAPS - 1)) / (0.001 + abs(r_B * 0.8))), 0, KERNEL_TAPS)];

		weight = mix(wNormal, 1.0, nearFieldness_A);

		// far + mid-field output 
		blurWeightSum += weight;
		blurResult.rgb += blurInput.rgb * weight;

		///////////////////////////////////////////////////////////////////////////////////////////////
		// Compute near-field super blurry buffer

		vec4 nearInput;

		if (horizontal)
		{
			// On the first pass, extract coverage from the near field radius
			// Note that the near field gets a box-blur instead of a kernel 
			// blur; we found that the quality improvement was not worth the 
			// performance impact of performing the kernel computation here as well.

			// Curve the contribution based on the radius.  We tuned this particular
			// curve to blow out the near field while still providing a reasonable
			// transition into the focus field.
			nearInput.a = float(float(abs(delta)) <= r_B) * saturate(r_B * uInvNearBlurRadiusPixels * 4.0);

			// Optionally increase edge fade contrast in the near field
			nearInput.a *= nearInput.a; nearInput.a *= nearInput.a;

			// Compute premultiplied-alpha color
			nearInput.rgb = blurInput.rgb * nearInput.a;
		}
		else
		{
			// On the second pass, use the already-available alpha values
			nearInput = texelFetch(nearTexture, clamp(B, ivec2(0), textureSize(nearTexture, 0) - ivec2(1)), 0);
			//nearInput = texture(nearTexture, B);
		}
		// We subsitute the following efficient expression for the more complex: weight = kernel[clamp(int(float(abs(delta) * (KERNEL_TAPS - 1)) * uInvNearBlurRadiusPixels), 0, KERNEL_TAPS)];
		//weight = float(abs(delta) < uNearBlurRadiusPixels);
		weight = kernel[clamp(int(float(abs(delta) * (KERNEL_TAPS - 1)) * uInvNearBlurRadiusPixels), 0, KERNEL_TAPS)];
		nearResult += nearInput * weight;
		nearWeightSum += weight;
	}

	// Normalize the blur
	nearResult /= max(nearWeightSum, 0.00001);
	blurResult.rgb /= blurWeightSum;

	if (horizontal)
	{
		// Retain the packed radius on the first pass.  On the second pass it is not needed.
		blurResult.a = packedA;
	}
	else
	{
		blurResult.a = 1.0;
	}

}