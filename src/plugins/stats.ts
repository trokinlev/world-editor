import Stats from "stats.js";
import type { Plugin, PluginRegisterProps } from "../core/world-editor";

export class StatsAdapter implements Plugin {
  private stats = new Stats();

  register(props: PluginRegisterProps): void {
    props.window.document.body.appendChild(this.stats.dom);
    props.addProcess(this.stats.begin, 10000);
    props.addProcess(this.stats.end, -10000);
  }
}