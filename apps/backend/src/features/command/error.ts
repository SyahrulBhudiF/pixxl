import { Effect, Schema } from "effect";

export class CommandError extends Schema.TaggedErrorClass<CommandError>()("CommandError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new CommandError({ message: message, cause }));
}
