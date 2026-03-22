import { Effect, Schema } from "effect";
import { EntityServiceError } from "@pixxl/shared";

export class CommandError extends Schema.TaggedErrorClass<CommandError>()("CommandError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new CommandError({ message, cause }));

  static fromEntity = (e: EntityServiceError) =>
    new CommandError({ message: e.message, cause: e.cause });
}
