import { Effect, Schema } from "effect";

export class AgentError extends Schema.TaggedErrorClass<AgentError>()("AgentError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new AgentError({ message, cause }));
}
