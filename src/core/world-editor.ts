import { Camera, Color, Object3D, Scene, WebGLRenderer } from "three";
import type { World } from "./world";

export interface PluginRegisterProps {
  window: Window;
  viewport: HTMLElement;
  camera: Camera;
  scene: Scene;
  world: World;
  addProcess(proc: Function, priority?: number): void;
}

export interface Plugin {
  register(props: PluginRegisterProps): void;
}

export class WorldEditor {
  private priorityProcesses: { process: Function; priority: number }[] = [];
  private nonPriorityProcesses: { process: Function; priority: number }[] = [];
  private processes: Function[] = [];
  private scene = new Scene();
  private window: Window;
  private viewport: HTMLElement;
  private camera: Camera;
  private world: World | null = null;

  constructor(window: Window, viewport: HTMLElement, camera: Camera) {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    viewport.appendChild(renderer.domElement);

    this.window = window;
    this.viewport = viewport;
    this.camera = camera;
    this.scene.background = new Color(0x555555);
    this.addProcess(renderer.render.bind(renderer, this.scene, camera));
    this.process();
  }

  addProcess(proc: Function, priority?: number) {
    if (!priority) return this.processes.push(proc);

    if (priority > 0 || priority === 0) {
      this.priorityProcesses.push({ process: proc, priority });
      this.priorityProcesses.sort((a, b) => b.priority - a.priority);
    } else {
      this.nonPriorityProcesses.push({ process: proc, priority });
      this.nonPriorityProcesses.sort((a, b) => b.priority - a.priority);
    }
  }

  setWorld(world: World) {
    this.world = world;
    this.world.setScene(this.scene);
  }

  usePlugin(plugin: Plugin | Object3D) {
    if (plugin instanceof Object3D) return this.scene.add(plugin);
    if (!this.world) return;

    plugin.register({
      window: this.window,
      viewport: this.viewport,
      camera: this.camera,
      scene: this.scene,
      world: this.world,
      addProcess: this.addProcess.bind(this),
    });
  }

  private process() {
    requestAnimationFrame(this.process.bind(this));

    for (const element of this.priorityProcesses) {
      const stop = element.process();
      if (stop === true) return;
    }

    for (const proc of this.processes) {
      proc();
    }

    for (const element of this.nonPriorityProcesses) {
      element.process();
    }
  }
}