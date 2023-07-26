export type NRPluginConfig<U = any, V = any> = {
  captureScalars?: boolean;
  captureIntrospectionQueries?: boolean;
  captureServiceDefinitionQueries?: boolean;
  captureHealthCheckQueries?: boolean;
  customResolverAttributes?: (
    resolverArguments: U
  ) => Record<string, string | number | boolean> | null;
  customOperationAttributes?: (
    requestContext: V
  ) => Record<string, string | number | boolean> | null;
  captureFieldMetrics?: boolean;
};

export default function createPlugin<T, U = any, V = any>(
  config?: NRPluginConfig<U, V>
): T;
