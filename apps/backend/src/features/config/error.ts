import { Effect, Schema } from "effect";

export class AppConfigError extends Schema.TaggedErrorClass<AppConfigError>()("AppConfigError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new AppConfigError({ message: message, cause }));
}

export class ConfigParseError extends Schema.TaggedErrorClass<ConfigParseError>()(
  "ConfigParseError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Unknown),
  },
) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new ConfigParseError({ message: message, cause }));
}

export class ConfigSerializeError extends Schema.TaggedErrorClass<ConfigSerializeError>()(
  "ConfigSerializeError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Unknown),
  },
) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new ConfigSerializeError({ message: message, cause }));
}
