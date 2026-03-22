import { Effect, Option } from "effect";
import { os } from "@/contract";
import { TerminalService } from "./service";

export const createTerminalRpc = os.terminal.createTerminal.handler(({ input }) =>
  Effect.gen(function* () {
    const service = yield* TerminalService;
    const terminal = yield* service.createTerminal(input);
    return Option.match(terminal, {
      onSome: (terminal) => terminal,
      onNone: () => null,
    });
  }).pipe(Effect.provide(TerminalService.live), Effect.runPromise),
);

export const updateTerminalRpc = os.terminal.updateTerminal.handler(({ input }) =>
  Effect.gen(function* () {
    const service = yield* TerminalService;
    const terminal = yield* service.updateTerminal(input);
    return Option.match(terminal, {
      onSome: (terminal) => terminal,
      onNone: () => null,
    });
  }).pipe(Effect.provide(TerminalService.live), Effect.runPromise),
);

export const deleteTerminalRpc = os.terminal.deleteTerminal.handler(({ input }) =>
  Effect.gen(function* () {
    const service = yield* TerminalService;
    return yield* service.deleteTerminal(input);
  }).pipe(Effect.provide(TerminalService.live), Effect.runPromise),
);

export const listTerminalsRpc = os.terminal.listTerminals.handler(({ input }) =>
  Effect.gen(function* () {
    const service = yield* TerminalService;
    return yield* service.listTerminals(input);
  }).pipe(Effect.provide(TerminalService.live), Effect.runPromise),
);
