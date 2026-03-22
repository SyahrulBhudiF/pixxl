import { createTerminalActor, type TerminalActor } from "./actor";
import type { TerminalActorInput } from "./actor";

class TerminalManager {
  private actors = new Map<string, TerminalActor>();

  getOrCreate(input: TerminalActorInput): TerminalActor {
    const existing = this.actors.get(input.terminalId);
    if (existing) {
      return existing;
    }
    const actor = createTerminalActor(input);
    this.actors.set(input.terminalId, actor);
    return actor;
  }

  get(terminalId: string): TerminalActor | undefined {
    return this.actors.get(terminalId);
  }

  remove(terminalId: string): void {
    const actor = this.actors.get(terminalId);
    if (actor) {
      actor.send({ type: "CLOSE" });
      this.actors.delete(terminalId);
    }
  }

  has(terminalId: string): boolean {
    return this.actors.has(terminalId);
  }
}

export const terminalManager = new TerminalManager();
