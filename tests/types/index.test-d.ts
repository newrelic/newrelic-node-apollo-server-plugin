import { ApolloServerPlugin } from "apollo-server-plugin-base";
import { expectType, expectAssignable } from "tsd";

import NRApolloPlugin, { createPlugin } from "../..";

expectAssignable<ApolloServerPlugin>(NRApolloPlugin);

expectType<ApolloServerPlugin>(createPlugin({}));

expectType<ApolloServerPlugin>(
  createPlugin({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);
