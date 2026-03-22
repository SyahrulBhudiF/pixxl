import { Effect, Layer, Option, ServiceMap } from "effect";
import {
  TerminalMetadata,
  TerminalMetadataSchema,
  CreateTerminalInput,
  EntityService,
} from "@pixxl/shared";
import { TerminalError } from "./error";
import { ProjectService } from "../project/service";
import { ConfigService } from "../config/service";
import { BunFileSystem, BunPath } from "@effect/platform-bun";
import { terminalManager } from "./manager";

type TerminalServiceShape = {
  readonly createTerminal: (
    input: CreateTerminalInput,
  ) => Effect.Effect<Option.Option<TerminalMetadata>, TerminalError>;
  readonly getTerminal: (input: {
    projectId: string;
    id: string;
  }) => Effect.Effect<Option.Option<TerminalMetadata>, TerminalError>;
  readonly updateTerminal: (input: {
    projectId: string;
    id: string;
    name: string;
  }) => Effect.Effect<Option.Option<TerminalMetadata>, TerminalError>;
  readonly deleteTerminal: (input: {
    projectId: string;
    id: string;
  }) => Effect.Effect<Option.Option<boolean>, TerminalError>;
  readonly listTerminals: (input: {
    projectId: string;
  }) => Effect.Effect<TerminalMetadata[], TerminalError>;
};

export class TerminalService extends ServiceMap.Service<TerminalService, TerminalServiceShape>()(
  "@pixxl/TerminalService",
  {
    make: Effect.gen(function* () {
      const entity = yield* EntityService;
      const project = yield* ProjectService;

      const terminals = entity.forEntity<TerminalMetadata, CreateTerminalInput>({
        directoryName: "terminals",
        schema: TerminalMetadataSchema,
        create: ({ id, now, name }) => ({
          id,
          name,
          createdAt: now,
          updatedAt: now,
        }),
        update: (current, { now, name }) => ({
          ...current,
          name,
          updatedAt: now,
        }),
      });

      const createTerminal = Effect.fn("TerminalService.createTerminal")(function* (
        input: CreateTerminalInput,
      ) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(TerminalError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none();
        }

        return yield* terminals
          .create({
            projectPath: projectResult.value.path,
            id: input.id,
            name: input.name,
          })
          .pipe(Effect.map(Option.some), Effect.mapError(TerminalError.fromEntity));
      });

      const getTerminal = Effect.fn("TerminalService.getTerminal")(function* (input: {
        projectId: string;
        id: string;
      }) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(TerminalError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none();
        }

        return yield* terminals
          .get({
            projectPath: projectResult.value.path,
            id: input.id,
          })
          .pipe(Effect.mapError(TerminalError.fromEntity));
      });

      const updateTerminal = Effect.fn("TerminalService.updateTerminal")(function* (input: {
        projectId: string;
        id: string;
        name: string;
      }) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(TerminalError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none();
        }

        return yield* terminals
          .update({
            projectPath: projectResult.value.path,
            id: input.id,
            name: input.name,
          })
          .pipe(Effect.mapError(TerminalError.fromEntity));
      });

      const deleteTerminal = Effect.fn("TerminalService.deleteTerminal")(function* (input: {
        projectId: string;
        id: string;
      }) {
        terminalManager.remove(input.id);

        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(TerminalError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return Option.none<boolean>();
        }

        return yield* terminals
          .delete({
            projectPath: projectResult.value.path,
            id: input.id,
          })
          .pipe(Effect.mapError(TerminalError.fromEntity));
      });

      const listTerminals = Effect.fn("TerminalService.listTerminals")(function* (input: {
        projectId: string;
      }) {
        const projectResult = yield* project
          .getProjectDetail({ id: input.projectId })
          .pipe(TerminalError.mapTo(`Failed to get project`));

        if (Option.isNone(projectResult)) {
          return [];
        }

        return yield* terminals
          .list({
            projectPath: projectResult.value.path,
          })
          .pipe(Effect.mapError(TerminalError.fromEntity));
      });

      return {
        createTerminal,
        getTerminal,
        updateTerminal,
        deleteTerminal,
        listTerminals,
      } as const;
    }),
  },
) {
  static layer = Layer.effect(TerminalService, TerminalService.make).pipe(
    Layer.provideMerge(EntityService.layer),
    Layer.provideMerge(ProjectService.layer),
    Layer.provideMerge(ConfigService.layer),
    Layer.provideMerge(Layer.mergeAll(BunFileSystem.layer, BunPath.layer)),
  );
}
