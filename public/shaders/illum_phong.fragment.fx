#version 300 es
precision mediump float;

// Input
in vec3 model_position;
in vec3 model_normal;
in vec2 model_uv;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {
    // model color, taken from gourad vertex shader
    vec3 model_color = mat_color * texture(mat_texture, model_uv).rgb;

    // these vars will be updated for each light
    vec3 diffuse_illum = vec3(0.0, 0.0, 0.0);
    vec3 specular_illum = vec3(0.0, 0.0, 0.0);

    // calculate N, the normalized surface normal
    vec3 N = normalize(model_normal);

    // calculate V, the normalized view direction
    vec3 V = normalize(camera_position - model_position);

    for(int i = 0; i < num_lights; i++) {

        // DIFFUSE LIGHT

        // calculate vector L for normalized light direction
        vec3 L = normalize(light_positions[i] - model_position);

        // (N dot L)
        float NdotL = clamp(dot(N, L), 0.0, 1.0);

        // update diffuse_illum with Ip * Kd * (N dot L)
        diffuse_illum += light_colors[i] * model_color * NdotL;

        // SPECULAR LIGHT
        // calculate vector R for normalized reflected light direction.
        // there's a reflect() function but it confused me so I just
        // calculate R manually here
        vec3 R = 2.0 * dot(N, L) * N - L;

        // calculate RdotV,
        // i am using clamp again here because value represents
        // cosine of angle between the two vectors R and V, so
        // there shouldn't be anything bigger than 1 or less than 0
        // so we don't add negative lighting
        float RdotV = clamp(dot(R, V), 0.0, 1.0);

        // calculate (RdotV)^n where n is shininess
        float RdotV_to_the_n = pow(RdotV, mat_shininess);

        // update specular_illum with Ip * Ks * (R dot V)^n
        specular_illum += light_colors[i] * mat_specular * RdotV_to_the_n; 
    }

    // Color
    //FragColor = vec4(mat_color * texture(mat_texture, model_uv).rgb, 1.0);

    FragColor = vec4(ambient + diffuse_illum + specular_illum, 1.0);
}
