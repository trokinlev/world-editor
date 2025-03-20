import type { Plugin, PluginRegisterProps } from "../../core/world-editor";
import { SpectatorControls } from "./spectator";

export class Player implements Plugin {
  register(props: PluginRegisterProps): void {
    const spectaror = new SpectatorControls(props.camera, {
      moveSpeed: 1,
      lookSpeed: 0.0005,
    });
    spectaror.enable();
    props.addProcess(spectaror.update.bind(spectaror));
  }
}