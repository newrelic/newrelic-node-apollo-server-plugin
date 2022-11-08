import type {ApolloServerPlugin as Base } from "apollo-server-plugin-base";
import type { ApolloServerPlugin } from "@apollo/server";

export type NRPluginConfig = {
  captureScalars?: boolean;
  captureIntrospectionQueries?: boolean;
  captureServiceDefinitionQueries?: boolean;
  captureHealthCheckQueries?: boolean;
};

export default function createPlugin<T>(config?: NRPluginConfig): T extends ApolloServerPlugin ? ApolloServerPlugin : Base; 
