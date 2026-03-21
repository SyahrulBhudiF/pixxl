import { Effect, Layer } from "effect";
import { os } from "@/contract";
import { ProjectService } from "./service";
import { ConfigService } from "../config/service";

export const createProjectRpc = os.project.createProject.handler(({ input }) =>
  Effect.gen(function* () {
    const service = yield* ProjectService;
    return yield* service.createProject(input);
  }).pipe(
    Effect.provide(ProjectService.live.pipe(Layer.provide(ConfigService.live))),
    Effect.runPromise,
  ),
);

export const listProjectsRpc = os.project.listProjects.handler(() =>
  Effect.gen(function* () {
    const service = yield* ProjectService;
    return yield* service.listProjects();
  }).pipe(
    Effect.provide(ProjectService.live.pipe(Layer.provide(ConfigService.live))),
    Effect.runPromise,
  ),
);
