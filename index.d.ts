export type NRPluginConfig = {
  captureScalars?: boolean;
  captureIntrospectionQueries?: boolean;
  captureServiceDefinitionQueries?: boolean;
  captureHealthCheckQueries?: boolean;
};

export default function createPlugin<T>(config?: NRPluginConfig): T;
