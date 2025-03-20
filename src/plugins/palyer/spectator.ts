import * as THREE from "three";

// actions
const FORWARD = 1 << 0;
const LEFT = 1 << 1;
const RIGHT = 1 << 2;
const BACK = 1 << 3;
const UP = 1 << 4;
const DOWN = 1 << 5;
const SPRINT = 1 << 6;

// defaults
const MOVESPEED = 1;
const FRICTION = 0.3;
const LOOKSPEED = 0.0005;
const SPRINTMULT = 2;
const KEYMAPPING: Record<number, string> = {
  87: "FORWARD", // W
  83: "BACK", // S
  65: "LEFT", // A
  68: "RIGHT", // D
  32: "UP", // Spacebar
  67: "DOWN", // C
  16: "SPRINT", // Shift
};

export class SpectatorControls {
  private camera: THREE.Camera;
  private lookSpeed: number;
  private moveSpeed: number;
  private friction: number;
  private sprintMultiplier: number;
  private keyMapping: Record<number, string>;
  private enabled: boolean;
  private isMousePressed: boolean = false; // <-- Флаг зажатия кнопки мыши
  private _mouseState: { x: number; y: number };
  private _keyState: { press: number; prevPress: number };
  private _moveState: { velocity: THREE.Vector3 };

  constructor(
    camera: THREE.Camera,
    {
      lookSpeed = LOOKSPEED,
      moveSpeed = MOVESPEED,
      friction = FRICTION,
      keyMapping = KEYMAPPING,
      sprintMultiplier = SPRINTMULT,
    } = {}
  ) {
    this.camera = camera;
    this.lookSpeed = lookSpeed;
    this.moveSpeed = moveSpeed;
    this.friction = friction;
    this.sprintMultiplier = sprintMultiplier;
    this.keyMapping = { ...KEYMAPPING, ...keyMapping };
    this.enabled = false;
    this._mouseState = { x: 0, y: 0 };
    this._keyState = { press: 0, prevPress: 0 };
    this._moveState = { velocity: new THREE.Vector3(0, 0, 0) };

    this._processMouseMoveEvent = this._processMouseMoveEvent.bind(this);
    this._processMouseDown = this._processMouseDown.bind(this);
    this._processMouseUp = this._processMouseUp.bind(this);
    this._processKeyEvent = this._processKeyEvent.bind(this);
  }

  private _processMouseMoveEvent(event: MouseEvent): void {
    this._processMouseMove(event.movementX, event.movementY);
  }

  private _processMouseMove(x = 0, y = 0): void {
  //   if (!this.isMousePressed) return; // <-- Проверяем, зажата ли кнопка мыши
  //   this._mouseState = { x, y };
  }

  private _processMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      // Правая кнопка мыши
      this.isMousePressed = true;
    }
  }

  private _processMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      // Правая кнопка мыши
      this.isMousePressed = false;
    }
  }

  private _processKeyEvent(event: KeyboardEvent): void {
    this._processKey(event.keyCode, event.type === "keydown");
  }

  private _processKey(key: number, isPressed: boolean): void {
    const { press } = this._keyState;
    let newPress = press;
    switch (this.keyMapping[key]) {
      case "FORWARD":
        isPressed ? (newPress |= FORWARD) : (newPress &= ~FORWARD);
        break;
      case "BACK":
        isPressed ? (newPress |= BACK) : (newPress &= ~BACK);
        break;
      case "LEFT":
        isPressed ? (newPress |= LEFT) : (newPress &= ~LEFT);
        break;
      case "RIGHT":
        isPressed ? (newPress |= RIGHT) : (newPress &= ~RIGHT);
        break;
      case "UP":
        isPressed ? (newPress |= UP) : (newPress &= ~UP);
        break;
      case "DOWN":
        isPressed ? (newPress |= DOWN) : (newPress &= ~DOWN);
        break;
      case "SPRINT":
        isPressed ? (newPress |= SPRINT) : (newPress &= ~SPRINT);
        break;
      default:
        break;
    }
    this._keyState.press = newPress;
  }

  private _processWheelEvent(e: WheelEvent): void {
    e.preventDefault();
    // if (!this.enabled) return;
    // const actualLookSpeed = this.lookSpeed * 5; // Усиливаем эффект
    // const lon = event.x * actualLookSpeed; // Поворот вокруг Y (влево-вправо)
    // const lat = event.y * actualLookSpeed; // Наклон по X (вверх-вниз)
    // console.log({ x: lon, y: lat });
    // posX -= e.deltaX * 2;
    // posY -= e.deltaY * 2;
    this._mouseState = { x: -e.deltaX, y: -e.deltaY };
    
    // this.camera.rotation.y -= lon;
    // this.camera.rotation.x = Math.max(
    //   Math.min(this.camera.rotation.x - lat, Math.PI / 2),
    //   -Math.PI / 2
    // );
  }

  public enable(): void {
    document.addEventListener("wheel", this._processWheelEvent.bind(this), { passive: false });
    document.addEventListener("mousemove", this._processMouseMoveEvent);
    document.addEventListener("mousedown", this._processMouseDown);
    document.addEventListener("mouseup", this._processMouseUp);
    document.addEventListener("keydown", this._processKeyEvent);
    document.addEventListener("keyup", this._processKeyEvent);
    this.enabled = true;
    this.camera.rotation.reorder("YXZ");
  }

  public disable(): void {
    document.addEventListener("wheel", this._processWheelEvent, { passive: false });
    document.removeEventListener("mousemove", this._processMouseMoveEvent);
    document.removeEventListener("mousedown", this._processMouseDown);
    document.removeEventListener("mouseup", this._processMouseUp);
    document.removeEventListener("keydown", this._processKeyEvent);
    document.removeEventListener("keyup", this._processKeyEvent);
    this.enabled = false;
    this.isMousePressed = false;
    this._keyState.press = 0;
    this._keyState.prevPress = 0;
    this._mouseState = { x: 0, y: 0 };
    this.camera.rotation.reorder("XYZ");
  }

  public update(delta = 1): void {
    if (!this.enabled) return;

    // Двигаем камеру только если мышь зажата
    // if (this.isMousePressed) {
    // console.log(this._mouseState);
      const actualLookSpeed = delta * this.lookSpeed;
      const lon = 20 * this._mouseState.x * actualLookSpeed;
      const lat = 20 * this._mouseState.y * actualLookSpeed;
      this.camera.rotation.x = Math.max(
        Math.min(this.camera.rotation.x - lat, Math.PI / 2),
        -Math.PI / 2
      );
      this.camera.rotation.y -= lon;
      this._mouseState = { x: 0, y: 0 };
    // }

    // Движение
    let actualMoveSpeed = delta * this.moveSpeed;
    const velocity = this._moveState.velocity.clone();
    const { press } = this._keyState;
    if (press & SPRINT) actualMoveSpeed *= this.sprintMultiplier;
    if (press & FORWARD) velocity.z = -actualMoveSpeed;
    if (press & BACK) velocity.z = actualMoveSpeed;
    if (press & LEFT) velocity.x = -actualMoveSpeed;
    if (press & RIGHT) velocity.x = actualMoveSpeed;
    if (press & UP) velocity.y = actualMoveSpeed;
    if (press & DOWN) velocity.y = -actualMoveSpeed;
    this._moveCamera(velocity);

    this._moveState.velocity = velocity;
    this._keyState.prevPress = press;
  }

  private _moveCamera(velocity: THREE.Vector3): void {
    velocity.multiplyScalar(this.friction);
    velocity.clampLength(0, this.moveSpeed);
    this.camera.translateZ(velocity.z);
    this.camera.translateX(velocity.x);
    this.camera.translateY(velocity.y);
  }
}
