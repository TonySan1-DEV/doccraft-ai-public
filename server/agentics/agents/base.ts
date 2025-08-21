import type { Artifact } from '../../../src/agentics/types';
import type { Blackboard } from '../blackboard.memory';

export interface AgentContext {
  board: Blackboard;
  log: (msg: string, extra?: Record<string, unknown>) => void;
}

export abstract class BaseAgent {
  constructor(
    public readonly name: string,
    protected ctx: AgentContext
  ) {}
  protected write<T>(
    artifact: Omit<Artifact<T>, 'id' | 'createdAt'> & { data: T }
  ) {
    return this.ctx.board.put<T>(artifact);
  }
  abstract run(input: unknown): Promise<void>;
}
