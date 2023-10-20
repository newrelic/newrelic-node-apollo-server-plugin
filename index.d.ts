import type { NRPluginConfig } from './config';

declare function createPlugin<T, U = any, V = any>(
  config?: NRPluginConfig<U, V>
): T;

export = createPlugin;
