import { ApolloServerPlugin as V3Plugin } from "apollo-server-plugin-base";
import { ApolloServerPlugin as V4Plugin } from "@apollo/server";
import { expectType } from "tsd";

import createPlugin from "../..";

expectType<V3Plugin>(createPlugin<V3Plugin>({}));
expectType<V3Plugin>(
  createPlugin<V3Plugin>({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);

expectType<V4Plugin>(createPlugin<V4Plugin>({}))
expectType<V4Plugin>(
  createPlugin<V4Plugin>({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);
