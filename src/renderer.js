import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { VertexData } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";

const BASE_URL = import.meta.env.BASE_URL || "/";

class Renderer {
  constructor(canvas, engine, material_callback, ground_mesh_callback) {
    this.canvas = canvas;
    this.engine = engine;
    this.scenes = [
      {
        scene: new Scene(this.engine),
        background_color: new Color4(0.1, 0.1, 0.1, 1.0),
        materials: null,
        ground_subdivisions: [50, 50],
        ground_mesh: null,
        camera: null,
        ambient: new Color3(0.2, 0.2, 0.2),
        lights: [],
        models: [],
      },
      {
        scene: new Scene(this.engine),
        background_color: new Color4(0.1, 0.1, 0.1, 1.0),
        materials: null,
        ground_subdivisions: [50, 50],
        ground_mesh: null,
        camera: null,
        ambient: new Color3(0.2, 0.2, 0.2),
        lights: [],
        models: [],
      },
      {
        scene: new Scene(this.engine),
        background_color: new Color4(0.1, 0.1, 0.1, 1.0),
        materials: null,
        ground_subdivisions: [50, 50],
        ground_mesh: null,
        camera: null,
        ambient: new Color3(0.2, 0.2, 0.2),
        lights: [],
        models: [],
      },
    ];
    this.active_scene = 0;
    this.active_light = 0;
    this.shading_alg = "gouraud";

    this.scenes.forEach((scene, idx) => {
      scene.materials = material_callback(scene.scene);
      scene.ground_mesh = ground_mesh_callback(
        scene.scene,
        scene.ground_subdivisions
      );
      this["createScene" + idx](idx);
    });
    //ABDULLAH MOVING LIGHTS
    window.addEventListener("keypress", (key) => {
      if (String.fromCharCode(key.keyCode) === "a") {
        this.scenes[this.active_scene].lights[
          this.active_light
        ].position.x -= 1;
      } else if (String.fromCharCode(key.keyCode) === "d") {
        this.scenes[this.active_scene].lights[
          this.active_light
        ].position.x += 1;
      } else if (String.fromCharCode(key.keyCode) === "f") {
        this.scenes[this.active_scene].lights[
          this.active_light
        ].position.y -= 1;
      } else if (String.fromCharCode(key.keyCode) === "r") {
        this.scenes[this.active_scene].lights[
          this.active_light
        ].position.y += 1;
      } else if (String.fromCharCode(key.keyCode) === "w") {
        this.scenes[this.active_scene].lights[
          this.active_light
        ].position.z -= 1;
      } else if (String.fromCharCode(key.keyCode) === "s") {
        this.scenes[this.active_scene].lights[
          this.active_light
        ].position.z += 1;
      }
    });
  }

  createScene0(scene_idx) {
    let current_scene = this.scenes[scene_idx];
    let scene = current_scene.scene;
    let materials = current_scene.materials;
    let ground_mesh = current_scene.ground_mesh;

    // Set scene-wide / environment values
    scene.clearColor = current_scene.background_color;
    scene.ambientColor = current_scene.ambient;
    scene.useRightHandedSystem = true;
    //Test until fixes it
    // Create camera
    current_scene.camera = new UniversalCamera(
      "camera",
      new Vector3(0.0, 1.8, 10.0),
      scene
    );
    current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
    current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
    current_scene.camera.attachControl(this.canvas, true);
    current_scene.camera.fov = 60.0 * (Math.PI / 180);
    current_scene.camera.minZ = 0.1;
    current_scene.camera.maxZ = 100.0;

    // Create point light sources
    let light0 = new PointLight("light0", new Vector3(1.0, 1.0, 5.0), scene);
    light0.diffuse = new Color3(1.0, 1.0, 1.0);
    light0.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light0);

    let light1 = new PointLight("light1", new Vector3(0.0, 3.0, 0.0), scene);
    light1.diffuse = new Color3(1.0, 1.0, 1.0);
    light1.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light1);

    // Create ground mesh
    let white_texture = RawTexture.CreateRGBTexture(
      new Uint8Array([255, 255, 255]),
      1,
      1,
      scene
    );
    let ground_heightmap = new Texture(
      BASE_URL + "heightmaps/default.png",
      scene
    );
    ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
    ground_mesh.metadata = {
      mat_color: new Color3(0.047, 0.039, 0.42),
      mat_texture: new Texture(BASE_URL + "textures/sky1.jpg", scene),
      mat_specular: new Color3(0.0, 0.0, 0.0),
      mat_shininess: 1,
      texture_scale: new Vector2(1.0, 1.0),
      height_scalar: 1.0,
      heightmap: ground_heightmap,
    };
    ground_mesh.material = materials["ground_" + this.shading_alg];

    // Create other models
    for (let i = 0; i < 10; i++) {
      let sphere = CreateSphere(
        "sphere" + i,
        { diameter: 1, segments: 100 },
        scene
      );
      sphere.position = new Vector3(i * 2 - 8.5, 1.5, 3.0); // Adjust the x-coordinate for spacing
      // sphere moon
      let color;
      switch (i % 7) {
        case 0:
          color = new Color3(1, 1, 1); // Blue color
          break;
        case 1:
          color = new Color3(1, 1, 1); // Red color
          break;
        case 2:
          color = new Color3(1, 1, 1); // Green color
          break;
        case 3:
          color = new Color3(1, 1, 1); // Yellow color
          break;
        default:
          color = new Color3(1, 1, 1); // Default white color
          break;
      }
      sphere.metadata = {
        mat_color: color,
        mat_texture: new Texture(BASE_URL + "textures/themoon.jpg", scene),
        mat_specular: new Color3(0.8, 0.8, 0.8),
        mat_shininess: 6,
        texture_scale: new Vector2(1.0, 1.0),
      };
      sphere.material = materials["illum_" + this.shading_alg];
      current_scene.models.push(sphere);

      let sphere1 = CreateSphere(
        "sphere1",
        { diameter: 4, segments: 100 },
        scene
      );
      sphere1.position = new Vector3(0.5, 6.5, 3.0);
      sphere1.metadata = {
        mat_color: new Color3(1, 1, 1),
        mat_texture: new Texture(BASE_URL + "textures/themoon.jpg", scene),
        mat_specular: new Color3(0.8, 0.8, 0.8),
        mat_shininess: 16,
        texture_scale: new Vector2(1.0, 1.0),
      };
      sphere.material = materials["illum_" + this.shading_alg];
      current_scene.models.push(sphere1);
    }

    //Blue background suits the moon
    for (let i = 0; i < 20; i++) {
      let box = CreateBox("box" + i, { width: 1, height: 10, depth: 1 }, scene);
      box.position = new Vector3(i - 9.5, 5.5, -2.0);
      // Define unique colors for each box
      let color;
      switch (i % 4) {
        case 0:
          color = new Color3(-1.75, -0.15, -0.05); // blueish color
          break;
        case 1:
          color = new Color3(-1.75, -0.15, -0.05);
          break;
        case 2:
          color = new Color3(-1.75, -0.15, -0.05);
          break;
        case 3:
          color = new Color3(-1.75, -0.3, -0.05); // Another color
          break;
        // Add more cases for additional colors as needed
        default:
          color = new Color3(-1.0, -2.0, -3.5); // Default white color
          break;
      }
      box.metadata = {
        mat_color: color,
        mat_texture: white_texture,
        mat_specular: new Color3(0.4, 0.4, 0.4),
        mat_shininess: 8,
        texture_scale: new Vector2(1.0, 1.0),
      };
      box.material = materials["illum_" + this.shading_alg];
      current_scene.models.push(box);
    }

    // Animation function - called before each frame gets rendered
    scene.onBeforeRenderObservable.add(() => {
      // update models and lights here (if needed)
      // ...

      // update uniforms in shader programs
      this.updateShaderUniforms(
        scene_idx,
        materials["illum_" + this.shading_alg]
      );
      this.updateShaderUniforms(
        scene_idx,
        materials["ground_" + this.shading_alg]
      );
    });
  }

  createScene1(scene_idx) {
    let current_scene = this.scenes[scene_idx];
    let scene = current_scene.scene;
    let materials = current_scene.materials;
    let ground_mesh = current_scene.ground_mesh;

    // Set scene-wide / environment values
    scene.clearColor = current_scene.background_color;
    scene.ambientColor = current_scene.ambient;
    scene.useRightHandedSystem = true;

    // Create camera
    current_scene.camera = new UniversalCamera(
      "camera",
      new Vector3(0.0, 1.8, 10.0),
      scene
    );
    current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
    current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
    current_scene.camera.attachControl(this.canvas, true);
    current_scene.camera.fov = 35.0 * (Math.PI / 180);
    current_scene.camera.minZ = 0.1;
    current_scene.camera.maxZ = 100.0;

    // Create point light sources
    let light0 = new PointLight("light0", new Vector3(1.0, 1.0, 5.0), scene);
    light0.diffuse = new Color3(1.0, 1.0, 1.0);
    light0.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light0);

    let light1 = new PointLight("light1", new Vector3(0.0, -2.0, 0.0), scene);
    light1.diffuse = new Color3(1.0, 0.0, 1.0);
    light1.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light1);

    // Create ground mesh
    let white_texture = RawTexture.CreateRGBTexture(
      new Uint8Array([255, 255, 255]),
      1,
      1,
      scene
    );
    let ground_heightmap = new Texture(
      BASE_URL + "heightmaps/default.png",
      scene
    );
    ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
    ground_mesh.metadata = {
      mat_color: new Color3(0.1, 0.0, 1.0),
      mat_texture: white_texture,
      mat_specular: new Color3(0.0, 0.0, 0.0),
      mat_shininess: 1,
      texture_scale: new Vector2(1.0, 1.0),
      height_scalar: 1.0,
      heightmap: ground_heightmap,
    };
    ground_mesh.material = materials["ground_" + this.shading_alg];

    // ELLIPSOID STAIRCASE
    for (let j = 0; j < 10; j++) {
      let ellipsoid = CreateSphere(
        `sphere${j}`,
        { diameterX: 1.5, diameterY: 0.4, diameterZ: 0.4, segments: 16 },
        scene
      );
      ellipsoid.position = new Vector3(-1.0, 1.0 + 0.3 * j, 0.0 + 0.3 * -j);
      ellipsoid.metadata = {
        mat_color: new Color3(0.6, 0.35, 0.88),
        mat_texture: white_texture,
        mat_specular: new Color3(0.8, 0.8, 0.8),
        mat_shininess: 16,
        texture_scale: new Vector2(1.0, 1.0),
      };
      ellipsoid.material = materials["illum_" + this.shading_alg];
      current_scene.models.push(ellipsoid);
    }

    // STAIRCASE
    let staircase = new Mesh("staircase", scene);

    staircase.metadata = {
      mat_color: new Color3(0.75, 0.15, 0.05),
      mat_texture: white_texture,
      mat_specular: new Color3(0.4, 0.4, 0.4),
      mat_shininess: 4,
      texture_scale: new Vector2(1.0, 1.0),
    };

    let vertex_positions = [];
    let vertex_colors = [];
    let staircase_indices = [];
    let staircase_normals = [];

    let num_steps = 10;
    let step_height = 0.15;
    let step_width = 0.5;
    let step_depth = 0.2;

    for (let i = 0; i < num_steps; i++) {
      // i'm just manually adding the position offsets here
      // instead of setting a property like .position
      let y = 2 + i * step_height;
      let x = 2;
      let z = -i * step_depth;

      // front face
      vertex_positions.push(
        x,
        y,
        z,
        x + step_width,
        y,
        z,
        x + step_width,
        y + step_height,
        z,
        x,
        y + step_height,
        z
      );

      // top face
      vertex_positions.push(
        x,
        y + step_height,
        z,
        x + step_width,
        y + step_height,
        z,
        x + step_width,
        y + step_height,
        z - step_depth,
        x,
        y + step_height,
        z - step_depth
      );

      // bottom face
      vertex_positions.push(
        x,
        y - i * step_height,
        z,
        x + step_width,
        y - i * step_height,
        z,
        x + step_width,
        y - i * step_height,
        z - step_depth,
        x,
        y - i * step_height,
        z - step_depth
      );

      // right face
      vertex_positions.push(
        x + step_width,
        y,
        z,
        x + step_width,
        y,
        z - step_depth * (num_steps - i),
        x + step_width,
        y + step_height,
        z - step_depth * (num_steps - i),
        x + step_width,
        y + step_height,
        z
      );

      // left face
      vertex_positions.push(
        x,
        y,
        z,
        x,
        y,
        z - step_depth * (num_steps - i),
        x,
        y + step_height,
        z - step_depth * (num_steps - i),
        x,
        y + step_height,
        z
      );

      // back face
      vertex_positions.push(
        x,
        y,
        z - step_depth * (num_steps - i),
        x + step_width,
        y,
        z - step_depth * (num_steps - i),
        x + step_width,
        y + step_height,
        z - step_depth * (num_steps - i),
        x,
        y + step_height,
        z - step_depth * (num_steps - i)
      );

      // normals

      // front face
      let normal = new Vector3(0, 0, 1);

      for (let j = 0; j < 4; j++) {
        staircase_normals.push(normal.x, normal.y, normal.z);
      }

      // top face
      normal = new Vector3(0, 0, -1);

      for (let j = 0; j < 4; j++) {
        staircase_normals.push(normal.x, normal.y, normal.z);
      }

      // bottom face
      normal = new Vector3(0, -1, 0);

      console.log(normal);

      for (let j = 0; j < 4; j++) {
        staircase_normals.push(normal.x, normal.y, normal.z);
      }

      // right face
      normal = new Vector3(1, 0, 0);

      for (let j = 0; j < 4; j++) {
        staircase_normals.push(normal.x, normal.y, normal.z);
      }

      // left face
      normal = new Vector3(-1, 0, 0);

      for (let j = 0; j < 4; j++) {
        staircase_normals.push(normal.x, normal.y, normal.z);
      }

      // back face
      normal = new Vector3(0, 0, -1);

      for (let j = 0; j < 4; j++) {
        staircase_normals.push(normal.x, normal.y, normal.z);
      }

      // indices
      let offset = i * 24;
      staircase_indices.push(
        offset,
        offset + 1,
        offset + 2,
        offset,
        offset + 2,
        offset + 3
      );

      staircase_indices.push(
        offset + 4,
        offset + 5,
        offset + 6,
        offset + 4,
        offset + 6,
        offset + 7
      );

      staircase_indices.push(
        offset + 8,
        offset + 9,
        offset + 10,
        offset + 8,
        offset + 10,
        offset + 11
      );

      staircase_indices.push(
        offset + 12,
        offset + 13,
        offset + 14,
        offset + 12,
        offset + 14,
        offset + 15
      );

      staircase_indices.push(
        offset + 16,
        offset + 17,
        offset + 18,
        offset + 16,
        offset + 18,
        offset + 19
      );

      staircase_indices.push(
        offset + 20,
        offset + 21,
        offset + 22,
        offset + 20,
        offset + 22,
        offset + 23
      );

      // colors
      let color = staircase.metadata.mat_color;

      for (let j = 0; j < 16; j++) {
        vertex_colors.push(color.r, color.g, color.b, 1.0);
      }
    }

    let vertex_data = new VertexData();
    vertex_data.positions = vertex_positions;
    vertex_data.colors = vertex_colors;
    vertex_data.normals = staircase_normals;
    vertex_data.indices = staircase_indices;

    vertex_data.applyToMesh(staircase);

    // Assign staircase a material and set its transforms
    staircase.material = materials["illum_" + this.shading_alg];
    current_scene.models.push(staircase);

    // Animation function - called before each frame gets rendered
    scene.onBeforeRenderObservable.add(() => {
      // update models and lights here (if needed)
      // ...

      // update uniforms in shader programs
      this.updateShaderUniforms(
        scene_idx,
        materials["illum_" + this.shading_alg]
      );
      this.updateShaderUniforms(
        scene_idx,
        materials["ground_" + this.shading_alg]
      );
    });
  }
  //CREATESCENE2 ABDULLAH
  createScene2(scene_idx) {
    let current_scene = this.scenes[scene_idx];
    let scene = current_scene.scene;
    let materials = current_scene.materials;
    let ground_mesh = current_scene.ground_mesh;

    // Set scene-wide / environment values
    scene.clearColor = current_scene.background_color;
    scene.ambientColor = current_scene.ambient;
    scene.useRightHandedSystem = true;

    // Create camera
    current_scene.camera = new UniversalCamera(
      "camera",
      new Vector3(0.0, 1.8, 10.0),
      scene
    );
    current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
    current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
    current_scene.camera.attachControl(this.canvas, true);
    current_scene.camera.fov = 35.0 * (Math.PI / 180);
    current_scene.camera.minZ = 0.1;
    current_scene.camera.maxZ = 100.0;

    // Create point light sources
    let light0 = new PointLight("light0", new Vector3(1.0, 1.0, 5.0), scene);
    light0.diffuse = new Color3(1.0, 1.0, 1.0);
    light0.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light0);

    let light1 = new PointLight("light1", new Vector3(0.0, 3.0, 0.0), scene);
    light1.diffuse = new Color3(1.0, 1.0, 1.0);
    light1.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light1);

    let light2 = new PointLight("light2", new Vector3(1.0, 5.0, -10.0), scene);
    light2.diffuse = new Color3(1.0, 1.0, 1.0);
    light2.specular = new Color3(1.0, 1.0, 1.0);
    current_scene.lights.push(light2);

    // Create ground mesh
    let white_texture = RawTexture.CreateRGBTexture(
      new Uint8Array([255, 255, 255]),
      1,
      1,
      scene
    );
    let ground_heightmap = new Texture(
      BASE_URL + "heightmaps/default.png",
      scene
    );
    ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
    ground_mesh.metadata = {
      mat_color: new Color3(0.1, 0.65, 0.15),
      mat_texture: white_texture,
      mat_specular: new Color3(0.0, 0.0, 0.0),
      mat_shininess: 1,
      texture_scale: new Vector2(1.0, 1.0),
      height_scalar: 1.0,
      heightmap: ground_heightmap,
    };
    ground_mesh.material = materials["ground_" + this.shading_alg];

    // Create cylinder
    let cylinder = CreateCylinder(
      "cylinder",
      {
        diameterTop: 1,
        diameterBottom: 1,
        height: 3,
        tessellation: 32,
      },
      scene
    );
    cylinder.position = new Vector3(2, 1.5, 0);
    cylinder.metadata = {
      mat_color: new Color3(0.5, 0.5, 0.5),
      mat_texture: white_texture,
      mat_specular: new Color3(0.8, 0.8, 0.8),
      mat_shininess: 16,
      texture_scale: new Vector2(1.0, 1.0),
    };
    cylinder.material = materials["illum_" + this.shading_alg];
    current_scene.models.push(cylinder);
    // Animation function - called before each frame gets rendered
    scene.onBeforeRenderObservable.add(() => {
      // update models and lights here (if needed)
      // ...

      // update uniforms in shader programs
      this.updateShaderUniforms(
        scene_idx,
        materials["illum_" + this.shading_alg]
      );
      this.updateShaderUniforms(
        scene_idx,
        materials["ground_" + this.shading_alg]
      );
    });
  }
  // mimicking our in-class example of this
  // takes input array of 3 vertices
  computeNormal(v1, v2, v3) {
    const vector_one = v2.subtract(v1);
    const vector_two = v3.subtract(v1);
    return Vector3.Cross(vector_one, vector_two).normalize();
  }

  updateShaderUniforms(scene_idx, shader) {
    let current_scene = this.scenes[scene_idx];
    shader.setVector3("camera_position", current_scene.camera.position);
    shader.setColor3("ambient", current_scene.scene.ambientColor);
    shader.setInt("num_lights", current_scene.lights.length);
    let light_positions = [];
    let light_colors = [];
    current_scene.lights.forEach((light) => {
      light_positions.push(
        light.position.x,
        light.position.y,
        light.position.z
      );
      light_colors.push(light.diffuse);
    });
    shader.setArray3("light_positions", light_positions);
    shader.setColor3Array("light_colors", light_colors);
  }

  getActiveScene() {
    return this.scenes[this.active_scene].scene;
  }

  setActiveScene(idx) {
    this.active_scene = idx;
  }

  setShadingAlgorithm(algorithm) {
    this.shading_alg = algorithm;

    this.scenes.forEach((scene) => {
      let materials = scene.materials;
      let ground_mesh = scene.ground_mesh;

      ground_mesh.material = materials["ground_" + this.shading_alg];
      scene.models.forEach((model) => {
        model.material = materials["illum_" + this.shading_alg];
      });
    });
  }

  setHeightScale(scale) {
    this.scenes.forEach((scene) => {
      let ground_mesh = scene.ground_mesh;
      ground_mesh.metadata.height_scalar = scale;
    });
  }

  setActiveLight(idx) {
    console.log(idx);
    this.active_light = idx;
  }
}

export { Renderer };
