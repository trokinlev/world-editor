import { Clock } from "three";
import type { Plugin, PluginRegisterProps } from "../core/world-editor";

export class FpsLimiter implements Plugin {
  public delta = 0;
  private clock = new Clock();

  constructor(private fps: number) {}

  limit(): boolean {
    this.delta += this.clock.getDelta();
    const interval = 1 / this.fps;

    if (this.delta > interval) {
      this.delta = this.delta % interval;
      return true
    };

    return false;
  }

  register(props: PluginRegisterProps): void {
    props.addProcess(this.limit.bind(this), 10001);
  }
}
