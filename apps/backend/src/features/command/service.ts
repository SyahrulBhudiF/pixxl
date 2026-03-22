import { Effect, Layer, Option, ServiceMap } from "effect";
import {
  CommandMetadata,
  CommandMetadataSchema,
  CreateCommandInput,
  ListCommandsInput,
  EntityService,
} from "@pixxl/shared";
import { CommandError } from "./error";
import { ProjectService } from "../project/service";
import { ConfigService } from "../config/service";
import { BunFileSystem, BunPath } from "@effect/platform-bun";

type CommandServiceShape = {
  readonly createCommand: (
    input: CreateCommandInput,
  ) => Effect.Effect<Option.Option<CommandMetadata>, CommandError>;
  readonly getCommand: (input: {
    projectId: string;
    id: string;
  }) => Effect.Effect<Option.Option<CommandMetadata>, CommandError>;
  readonly deleteCommand: (input: {
    projectId: string;
    id: string;
  }) => Effect.Effect<Option.Option<boolean>, CommandError>;
  readonly listCommands: (
    input: ListCommandsInput,
  ) => Effect.Effect<CommandMetadata[], CommandError>;
};

export class CommandService extends ServiceMap.Service<CommandService, CommandServiceShape>()(
  "@pixxl/CommandService",
  {
    make: Effect.gen(function* () {
      const entity = yield* EntityService;
      const project = yield* ProjectService;

      const commands = entity.forEntity<CommandMetadata, CreateCommandInput>({
        directoryName: "commands",
        schema: CommandMetadataSchema,
        create: ({ id, now, name, command, description }) => ({
          id,
          name,
          command,
          description,
          createdAt: now,
          updatedAt: now,
        }),
        update: (current, { now, ...patch }) => ({
          ...current,
          ...patch,
          updatedAt: now,
        }),
      });

      const createCommand = Effect.fn("CommandService.createCommand")(function* (
        input: CreateCommandInput,
      ) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(CommandError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none();
        }

        return yield* commands
          .create({
            projectPath: projectResult.value.path,
            id: input.id,
            name: input.name,
            command: input.command,
            description: input.description,
          })
          .pipe(Effect.map(Option.some), Effect.mapError(CommandError.fromEntity));
      });

      const getCommand = Effect.fn("CommandService.getCommand")(function* (input: {
        projectId: string;
        id: string;
      }) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(CommandError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none();
        }

        return yield* commands
          .get({
            projectPath: projectResult.value.path,
            id: input.id,
          })
          .pipe(Effect.mapError(CommandError.fromEntity));
      });

      const deleteCommand = Effect.fn("CommandService.deleteCommand")(function* (input: {
        projectId: string;
        id: string;
      }) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(CommandError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none<boolean>();
        }

        return yield* commands
          .delete({
            projectPath: projectResult.value.path,
            id: input.id,
          })
          .pipe(Effect.mapError(CommandError.fromEntity));
      });

      const listCommands = Effect.fn("CommandService.listCommands")(function* (
        input: ListCommandsInput,
      ) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(CommandError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return [];
        }

        return yield* commands
          .list({
            projectPath: projectResult.value.path,
          })
          .pipe(Effect.mapError(CommandError.fromEntity));
      });

      return { createCommand, getCommand, deleteCommand, listCommands } as const;
    }),
  },
) {
  static layer = Layer.effect(CommandService, CommandService.make).pipe(
    Layer.provideMerge(EntityService.layer),
    Layer.provideMerge(ProjectService.layer),
    Layer.provideMerge(ConfigService.layer),
    Layer.provideMerge(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)),
  );
}
