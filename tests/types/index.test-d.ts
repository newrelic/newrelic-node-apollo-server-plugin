import { ApolloServerPlugin as Base } from "apollo-server-plugin-base";
import { ApolloServerPlugin } from "@apollo/server";
import { expectType } from "tsd";

import createPlugin from "../..";

expectType<Base>(createPlugin({}));

expectType<Base>(
  createPlugin({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);

expectType<ApolloServerPlugin>(createPlugin<ApolloServerPlugin>({}))

expectType<ApolloServerPlugin>(
  createPlugin<ApolloServerPlugin>({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);
