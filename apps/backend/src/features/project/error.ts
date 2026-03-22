import { Effect, Schema } from "effect";

export class ProjectError extends Schema.TaggedErrorClass<ProjectError>()("ProjectError", {
  message: Schema.String,
  cause: Schema.optionalKey(Schema.Unknown),
}) {
  static mapTo = (message: string) =>
    Effect.mapError((cause) => new ProjectError({ message: message, cause }));
}
