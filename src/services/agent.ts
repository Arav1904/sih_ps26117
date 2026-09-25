import { SCENARIOS } from '../data/scenarios';
import type { RunRecord, Scenario, ScenarioKey } from '../types';
import { store } from '../state/store';

/* The agent service is deliberately thin. Today it drives the deterministic
   scenario timeline in the store; when the FastAPI orchestrator exists,
   `start` opens a stream and each message it emits has the shape of an
   AgentStep, so nothing above this line has to change. */
class AgentService {
  scenario(key: ScenarioKey): Scenario { return SCENARIOS[key]; }
  all(): Scenario[] { return Object.values(SCENARIOS); }

  start(key: ScenarioKey): void { store.start(key); }
  cancel(): void { store.cancel(); }

  progress(run: RunRecord): number {
    const total = SCENARIOS[run.scenario].steps.length;
    const settled = run.stepStates.filter((s) => s === 'done' || s === 'attention').length;
    return total === 0 ? 0 : settled / total;
  }

  currentIndex(run: RunRecord): number {
    const i = run.stepStates.indexOf('active');
    return i === -1 ? run.stepStates.length - 1 : i;
  }

  isRunning(run: RunRecord | null): run is RunRecord {
    return !!run && run.finishedAt === null;
  }
}

export const agent = new AgentService();
