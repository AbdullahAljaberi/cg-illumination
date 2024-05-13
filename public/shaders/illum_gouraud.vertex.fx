#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;
uniform float mat_shininess;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);

    // Pass vertex texcoord onto the fragment shader,
    // trying to figure out if I should clamp this
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);

    // position in world
    vec4 pos_in_world = world * vec4(position, 1.0);

    // diffuse: Ip * Kd * (N dot L)
    // we have Ip, which is light_positions
    // Kd will be calculated in fragment shader (next)
    // N is the normalized surface normal vector
    // L is the normalized light direction

    // calculate vector N in world space
    vec3 N = normalize(mat3(world) * normal);

    // i will calculate L in the for loop

    // specular: IpKs(R dot V)^n
    // again, we have Ip
    // Ks will be calculated in fragment shader (next)
    // R is normalized reflected light direction...
    // R = 2(N dot L)N - L
    // V is normalized view direction

    // i will calculate R in the for loop

    // calculate vector V
    vec3 V = normalize(camera_position - vec3(pos_in_world));


    for(int i = 0; i < num_lights; i++) {

        // DIFFUSE LIGHT

        // calculate vector L for normalized light direction
        vec3 L = normalize(light_positions[i] - vec3(pos_in_world));

        // start puting diffuse stuff together without Kd
        // using clamp method we saw in quiz to keep valid values here
        float NdotL = clamp(dot(N, L), 0.0, 1.0);

        // update diffuse_illum to be Ip * NdotL,
        // and i will add Kd in fragment shader
        diffuse_illum += light_colors[i] * NdotL;

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

        // update specular_illum
        specular_illum += light_colors[i] * RdotV_to_the_n;
        
    }
}