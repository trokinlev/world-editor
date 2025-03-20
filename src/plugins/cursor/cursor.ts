import {
  Camera,
  EventDispatcher,
  Vector2,
  Vector3,
  Raycaster,
  Plane,
  Ray,
} from "three";
import type { Plugin, PluginRegisterProps } from "../../core/world-editor";
import type { World } from "../../core/world";
import { BlockSide, Intersection } from "./intersection";

interface CursorEvents {
  move: { position: Vector3 };
  click: { position: Vector3 };
}

function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as T;
}

export class Cursor extends EventDispatcher<CursorEvents> implements Plugin {
  private raycaster = new Raycaster();
  private plane = new Plane(new Vector3(0, 1, 0), 0);
  private camera: Camera | null = null;
  private world: World | null = null;

  private mousePosition = new Vector2();
  private normalizedMousePosition = new Vector2();

  private cursorPosition = new Vector3();
  private currentCursorPosition = new Vector3();

  constructor() {
    super();
  }

  register(props: PluginRegisterProps): void {
    this.camera = props.camera;
    this.world = props.world;
    props.window.addEventListener("mousemove", throttle(this.onMouseMove.bind(this), 100));
    props.window.addEventListener("mousedown", () => {
      this.dispatchEvent({
        type: "click",
        position: this.currentCursorPosition.clone(),
      });
    });
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.world || !this.camera) return;

    this.normalizeMousePosition(
      this.mousePosition.set(event.clientX, event.clientY),
      window.innerWidth,
      window.innerHeight
    );
    this.raycaster.setFromCamera(this.normalizedMousePosition, this.camera);
    this.calculateCursorPosition(this.raycaster.ray);

    if (this.currentCursorPosition.equals(this.cursorPosition)) return;
    const dda = Intersection.rayDDA(
      this.raycaster.ray.origin,
      this.raycaster.ray.direction,
      1,
      this.world
    );

    if (dda) {
      this.cursorPosition = dda;
      const aabb = Intersection.rayAABB(
        this.raycaster.ray.origin,
        this.raycaster.ray.direction,
        dda,
        new Vector3(1, 1, 1)
      );

      switch (aabb) {
        case BlockSide.TOP:
          this.cursorPosition.y += 1;
          break;
        case BlockSide.BOTTOM:
          this.cursorPosition.y += -1;
          break;
        case BlockSide.FRONT:
          this.cursorPosition.z += 1;
          break;
        case BlockSide.BACK:
          this.cursorPosition.z += -1;
          break;
        case BlockSide.LEFT:
          this.cursorPosition.x += -1;
          break;
        case BlockSide.RIGHT:
          this.cursorPosition.x += 1;
          break;
      }
    }

    this.currentCursorPosition = this.cursorPosition.clone();
    this.dispatchEvent({
      type: "move",
      position: this.currentCursorPosition.clone(),
    });
  }

  private calculateCursorPosition(ray: Ray): void {
    if (!this.world) return;

    ray.intersectPlane(this.plane, this.cursorPosition);
    this.cursorPosition = this.world.worldToGrid(this.cursorPosition);
  }

  private normalizeMousePosition(
    position: Vector2,
    width: number,
    height: number
  ): void {
    this.normalizedMousePosition.set(
      (position.x / width) * 2 - 1,
      -(position.y / height) * 2 + 1
    );
  }
}
