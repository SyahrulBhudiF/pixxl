import { Effect, FileSystem, Layer, Option, Path, Schema, ServiceMap } from "effect";
import { generateId } from "../utils";

export class EntityServiceError extends Schema.TaggedErrorClass<EntityServiceError>()(
  "EntityServiceError",
  {
    message: Schema.String,
    cause: Schema.optionalKey(Schema.Unknown),
  },
) {
  static mapTo = (message: string) =>
    Effect.mapError((cause: unknown) => new EntityServiceError({ message, cause }));
}

export type EntityMetadata = {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type EntityDefinition<TEntity extends EntityMetadata, TCreate, TUpdate = TCreate> = {
  readonly directoryName: string;
  readonly schema: Schema.Schema<TEntity>;
  readonly create: (input: TCreate & { readonly id: string; readonly now: string }) => TEntity;
  readonly update: (current: TEntity, input: TUpdate & { readonly now: string }) => TEntity;
};

export type EntityOperations<TEntity, TCreate, TUpdate = TCreate> = {
  readonly create: (
    input: { readonly projectPath: string } & TCreate,
  ) => Effect.Effect<TEntity, EntityServiceError>;
  readonly get: (input: {
    readonly projectPath: string;
    readonly id: string;
  }) => Effect.Effect<Option.Option<TEntity>, EntityServiceError>;
  readonly update: (
    input: { readonly projectPath: string; readonly id: string } & TUpdate,
  ) => Effect.Effect<Option.Option<TEntity>, EntityServiceError>;
  readonly delete: (input: {
    readonly projectPath: string;
    readonly id: string;
  }) => Effect.Effect<Option.Option<boolean>, EntityServiceError>;
  readonly list: (input: {
    readonly projectPath: string;
  }) => Effect.Effect<Array<TEntity>, EntityServiceError>;
};

type EntityServiceShape = {
  readonly forEntity: <TEntity extends EntityMetadata, TCreate, TUpdate = TCreate>(
    definition: EntityDefinition<TEntity, TCreate, TUpdate>,
  ) => EntityOperations<TEntity, TCreate, TUpdate>;
};

export class EntityService extends ServiceMap.Service<EntityService, EntityServiceShape>()(
  "@pixxl/EntityService",
  {
    make: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const forEntity = <TEntity extends EntityMetadata, TCreate, TUpdate = TCreate>(
        definition: EntityDefinition<TEntity, TCreate, TUpdate>,
      ): EntityOperations<TEntity, TCreate, TUpdate> => {
        const entityPath = (projectPath: string) =>
          path.join(projectPath, definition.directoryName);

        const filePath = (projectPath: string, id: string) =>
          path.join(entityPath(projectPath), `${id}.json`);

        const decodeEntity = Schema.decodeUnknownEffect(Schema.fromJsonString(definition.schema));

        const create = Effect.fn("EntityService.create")(function* (
          input: { readonly projectPath: string } & TCreate,
        ) {
          const directoryPath = entityPath(input.projectPath);
          const exists = yield* fs
            .exists(directoryPath)
            .pipe(EntityServiceError.mapTo(`Failed to check path: ${directoryPath}`));

          if (!exists) {
            yield* fs
              .makeDirectory(directoryPath, { recursive: true })
              .pipe(EntityServiceError.mapTo(`Failed to create directory: ${directoryPath}`));
          }

          const now = new Date().toISOString();
          const entity = definition.create({
            ...input,
            now,
          });

          yield* fs
            .writeFileString(
              filePath(input.projectPath, entity.id),
              JSON.stringify(entity, null, 2),
            )
            .pipe(EntityServiceError.mapTo(`Failed to create entity`));

          return entity;
        });

        const get = Effect.fn("EntityService.get")(function* (input: {
          readonly projectPath: string;
          readonly id: string;
        }) {
          const currentFilePath = filePath(input.projectPath, input.id);
          const exists = yield* fs
            .exists(currentFilePath)
            .pipe(EntityServiceError.mapTo(`Failed to check file: ${currentFilePath}`));

          if (!exists) {
            return Option.none<TEntity>();
          }

          const content = yield* fs
            .readFileString(currentFilePath)
            .pipe(EntityServiceError.mapTo(`Failed to read entity`));

          const entity = yield* decodeEntity(content).pipe(
            EntityServiceError.mapTo(`Failed to decode entity`),
          );

          return Option.some(entity);
        });

        const update = Effect.fn("EntityService.update")(function* (
          input: { readonly projectPath: string; readonly id: string } & TUpdate,
        ) {
          const currentFilePath = filePath(input.projectPath, input.id);
          const exists = yield* fs
            .exists(currentFilePath)
            .pipe(EntityServiceError.mapTo(`Failed to check file: ${currentFilePath}`));

          if (!exists) {
            return Option.none<TEntity>();
          }

          const content = yield* fs
            .readFileString(currentFilePath)
            .pipe(EntityServiceError.mapTo(`Failed to read entity`));

          const current = yield* decodeEntity(content).pipe(
            EntityServiceError.mapTo(`Failed to decode entity`),
          );

          const entity = definition.update(current, {
            ...input,
            now: new Date().toISOString(),
          });

          yield* fs
            .writeFileString(currentFilePath, JSON.stringify(entity, null, 2))
            .pipe(EntityServiceError.mapTo(`Failed to update entity`));

          return Option.some(entity);
        });

        const remove = Effect.fn("EntityService.delete")(function* (input: {
          readonly projectPath: string;
          readonly id: string;
        }) {
          const currentFilePath = filePath(input.projectPath, input.id);
          const exists = yield* fs
            .exists(currentFilePath)
            .pipe(EntityServiceError.mapTo(`Failed to check file: ${currentFilePath}`));

          if (!exists) {
            return Option.none<boolean>();
          }

          yield* fs
            .remove(currentFilePath)
            .pipe(EntityServiceError.mapTo(`Failed to delete entity`));

          return Option.some(true);
        });

        const list = Effect.fn("EntityService.list")(function* (input: {
          readonly projectPath: string;
        }) {
          const directoryPath = entityPath(input.projectPath);
          const exists = yield* fs
            .exists(directoryPath)
            .pipe(EntityServiceError.mapTo(`Failed to check path: ${directoryPath}`));

          if (!exists) {
            return [];
          }

          const entries = yield* fs
            .readDirectory(directoryPath)
            .pipe(EntityServiceError.mapTo(`Failed to read directory`));
          const files = entries.filter((entry) => entry.endsWith(".json"));

          if (files.length === 0) {
            return [];
          }

          return yield* Effect.all(
            files.map((file) =>
              fs.readFileString(path.join(directoryPath, file)).pipe(
                EntityServiceError.mapTo(`Failed to read file: ${file}`),
                Effect.flatMap((content) =>
                  decodeEntity(content).pipe(
                    EntityServiceError.mapTo(`Failed to decode file: ${file}`),
                  ),
                ),
              ),
            ),
            { concurrency: 10 },
          );
        });

        return { create, get, update, delete: remove, list };
      };

      return { forEntity } as const;
    }),
  },
) {
  static layer = Layer.effect(EntityService, EntityService.make);
  static live = EntityService.layer;
}

export { generateId };
