import { Effect, Schema } from "effect";
import { EntityServiceError } from "@pixxl/shared";

export class TerminalError extends Schema.TaggedErrorClass<TerminalError>()("TerminalError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new TerminalError({ message, cause }));

  static fromEntity = (e: EntityServiceError) =>
    new TerminalError({ message: e.message, cause: e.cause });
}
