export type NRPluginConfig = {
  captureScalars?: boolean;
  captureIntrospectionQueries?: boolean;
  captureServiceDefinitionQueries?: boolean;
  captureHealthCheckQueries?: boolean;
  customResolverAttributes?: Function|null;
  customOperationAttributes?: Function|null;
  captureFieldMetrics?: boolean;
};

export default function createPlugin<T>(config?: NRPluginConfig): T;
