import { ApolloServerPlugin as V3Plugin } from "apollo-server-plugin-base";
import { ApolloServerPlugin as V4Plugin } from "@apollo/server";
import { expectType, expectNotType } from "tsd";

import createPlugin from "../..";


interface foo {}
const plugin: foo = createPlugin({})
expectNotType<V3Plugin>(plugin)
expectNotType<V3Plugin>(createPlugin<foo>({}))

const pluginV3: V3Plugin = createPlugin({})
expectType<V3Plugin>(pluginV3)
expectType<V3Plugin>(createPlugin<V3Plugin>({}));
expectType<V3Plugin>(
  createPlugin<V3Plugin>({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);

const pluginV4: V4Plugin = createPlugin({})
expectType<V4Plugin>(pluginV4)
expectType<V4Plugin>(createPlugin<V4Plugin>({}))
expectType<V4Plugin>(
  createPlugin<V4Plugin>({
    captureHealthCheckQueries: true,
    captureScalars: false,
    captureServiceDefinitionQueries: true,
  })
);
