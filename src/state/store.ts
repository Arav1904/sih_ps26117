import { useSyncExternalStore } from 'react';
import type { Artifact, InputFile, RunRecord, ScenarioKey, StepState } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { audit } from '../services/audit';
import { egressGuard } from '../services/networkPolicy';

/* ---------------------------------------------------------------
   Application state.

   One small store, no library. The deterministic agent timeline is
   driven from here: `start()` walks SCENARIOS[key].steps, marking
   each one active, then done (or attention), on its declared
   duration. When a real orchestrator exists, the same reducer is
   fed by a stream instead of a timer and nothing above changes.
   --------------------------------------------------------------- */

export type RunMode = 'demo' | 'live';

export interface AppState {
  booted: boolean;
  /** 'demo' = deterministic simulation. 'live' = real local services. */
  mode: RunMode;
  /** true when a live-mode connection was attempted and nothing answered */
  liveUnavailable: boolean;
  scenario: ScenarioKey;
  inputs: InputFile[];
  prompt: string;
  run: RunRecord | null;
  history: RunRecord[];
  artifacts: Artifact[];
  /** index into the guided demo script, or null when it is not running */
  guided: number | null;
}

const initial: AppState = {
  booted: false,
  mode: 'demo',
  liveUnavailable: false,
  scenario: 'inspection',
  inputs: [],
  prompt: '',
  run: null,
  history: [],
  artifacts: [],
  guided: null,
};

class Store {
  private state: AppState = initial;
  private listeners = new Set<() => void>();
  private timers: number[] = [];

  getSnapshot = (): AppState => this.state;
  subscribe = (f: () => void): (() => void) => { this.listeners.add(f); return () => { this.listeners.delete(f); }; };

  private set(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((f) => f());
  }

  boot(): void {
    if (this.state.booted) return;
    this.set({ booted: true });
    audit.record('session', 'Workbench opened on the on-premise node', 'demo mode · deterministic simulation · no external service contacted');
  }

  setPrompt(prompt: string): void { this.set({ prompt }); }

  setMode(mode: RunMode): void {
    if (mode === this.state.mode) return;
    this.set({ mode, liveUnavailable: false });
    audit.record('session', mode === 'live' ? 'Switched to live local mode' : 'Switched to demo mode',
      mode === 'live' ? 'the workbench will call the orchestrator on 127.0.0.1:8000' : 'deterministic simulation, nothing is inferred');
    if (mode === 'live') void this.probeLive();
  }

  /** Live mode needs a local orchestrator. In this prototype there is
   *  none, so the probe fails and the UI says so rather than pretending. */
  private async probeLive(): Promise<void> {
    try {
      const res = await fetch('http://127.0.0.1:8000/healthz');
      if (!res.ok) throw new Error(String(res.status));
      this.set({ liveUnavailable: false });
    } catch {
      this.set({ liveUnavailable: true });
      audit.record('session', 'Local orchestrator did not answer', '127.0.0.1:8000 — falling back to demo mode');
    }
  }

  attach(files: InputFile[]): void {
    if (!files.length) return;
    this.set({ inputs: [...this.state.inputs, ...files] });
    audit.record('task', 'Files attached from local disk', files.map((f) => f.name).join(', '));
  }

  clearTimers(): void { this.timers.forEach((t) => clearTimeout(t)); this.timers = []; }

  start(key: ScenarioKey): void {
    this.clearTimers();
    const sc = SCENARIOS[key];
    const run: RunRecord = {
      id: 'run-' + Date.now().toString(36),
      scenario: key,
      label: sc.label,
      startedAt: Date.now(),
      finishedAt: null,
      stepStates: sc.steps.map(() => 'pending' as StepState),
      toolCalls: [],
      artifacts: [],
    };
    this.set({ scenario: key, inputs: [...sc.inputs], prompt: sc.prompt, run });
    audit.record('task', 'Task accepted', `${sc.label} · ${sc.inputs.map((f) => f.name).join(', ')}`);
    this.advance(0);
  }

  cancel(): void {
    this.clearTimers();
    if (this.state.run && this.state.run.finishedAt === null) {
      audit.record('task', 'Run stopped by the operator', this.state.run.label);
    }
    this.set({ run: null });
  }

  reset(): void {
    this.clearTimers();
    this.set({ run: null, history: [], artifacts: [], inputs: [], prompt: '', guided: null });
    audit.record('session', 'Workspace cleared', 'runs, artifacts and attachments discarded');
  }

  /* ------------------------- guided demo ------------------------- */

  startGuided(): void { this.set({ guided: 0 }); audit.record('session', 'Guided demo started', 'walkthrough of the golden path'); }
  guidedNext(total: number): void {
    const g = this.state.guided;
    if (g === null) return;
    this.set({ guided: g + 1 >= total ? null : g + 1 });
  }
  guidedBack(): void {
    const g = this.state.guided;
    if (g === null) return;
    this.set({ guided: Math.max(0, g - 1) });
  }
  stopGuided(): void { this.set({ guided: null }); }

  /* --------------------------- timeline -------------------------- */

  private advance(i: number): void {
    const run = this.state.run;
    if (!run) return;
    const sc = SCENARIOS[run.scenario];
    if (i >= sc.steps.length) { this.finish(); return; }
    const step = sc.steps[i]!;

    const states = [...run.stepStates];
    states[i] = 'active';
    egressGuard.noteInternal(step.tool);
    audit.record('agent', step.title, step.tool);
    this.set({
      run: { ...run, stepStates: states, toolCalls: [{ at: Date.now(), tool: step.tool, title: step.title }, ...run.toolCalls] },
    });

    this.timers.push(
      window.setTimeout(() => {
        const cur = this.state.run;
        if (!cur) return;
        const next = [...cur.stepStates];
        next[i] = step.attention ? 'attention' : 'done';
        this.set({ run: { ...cur, stepStates: next } });
        this.timers.push(window.setTimeout(() => this.advance(i + 1), 120));
      }, step.durationMs),
    );
  }

  private finish(): void {
    const run = this.state.run;
    if (!run) return;
    const finishedAt = Date.now();
    const made: Artifact[] =
      run.scenario === 'inspection'
        ? [
            { id: run.id + '-a', runId: run.id, name: 'Approval_Note_Unit04_CDU.docx', kind: 'docx', verification: 'flagged',
              note: 'one page held for a human read', sources: 'Inspection_Report_Unit_04.pdf, PID_Sheet_07_CDU04.png', createdAt: finishedAt },
            { id: run.id + '-b', runId: run.id, name: 'Inspection_Estimate_Unit04.xlsx', kind: 'xlsx', verification: 'pass',
              note: 'totals independently recomputed', sources: 'RATE-2026 rate schedule', createdAt: finishedAt },
          ]
        : [
            { id: run.id + '-a', runId: run.id, name: 'flow_calc_verified.py', kind: 'py', verification: 'pass',
              note: '7 of 7 tests pass in the sandbox', sources: 'flow_calc.py, ISO-5167-2', createdAt: finishedAt },
          ];

    const done: RunRecord = { ...run, finishedAt, artifacts: made.map((a) => a.id) };
    this.set({ run: done, history: [done, ...this.state.history], artifacts: [...made, ...this.state.artifacts] });
    audit.record(
      'task', 'Run complete',
      `${run.label} · ${((finishedAt - run.startedAt) / 1000).toFixed(1)}s · ${made.length} artifact${made.length > 1 ? 's' : ''}`,
    );
  }
}

export const store = new Store();

export function useApp(): AppState {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
