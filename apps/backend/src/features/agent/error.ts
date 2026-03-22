import { Effect, Schema } from "effect";
import { EntityServiceError } from "@pixxl/shared";

export class AgentError extends Schema.TaggedErrorClass<AgentError>()("AgentError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new AgentError({ message, cause }));

  static fromEntity = (e: EntityServiceError) =>
    new AgentError({ message: e.message, cause: e.cause });
}
