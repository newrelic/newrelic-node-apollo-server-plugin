import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { expectType } from "tsd";

import createPlugin from "../..";

expectType<ApolloServerPlugin>(createPlugin({}));

expectType<ApolloServerPlugin>(
  createPlugin({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);
