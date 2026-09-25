import { MODELS, GPU_TOTAL_GB } from '../data/corpus';
import { SCENARIOS } from '../data/scenarios';
import type { ModelRecord, RoutingDecision, ScenarioKey } from '../types';

/* The registry is the whole point of the model-agnostic claim: a model is
   a row, not a code path. Nothing below is specific to any one vendor. */
class ModelRouterService {
  registry(): ModelRecord[] { return MODELS; }
  loaded(): ModelRecord[] { return MODELS.filter((m) => m.state === 'loaded'); }
  vramCommitted(): number { return this.loaded().reduce((n, m) => n + m.vramGb, 0); }
  vramTotal(): number { return GPU_TOTAL_GB; }
  families(): number { return new Set(MODELS.map((m) => m.name.split(/[-.]/)[0])).size; }

  /** In deployment this reads the classified task and the input inventory.
   *  Here it returns the decision the scenario declares. */
  route(scenario: ScenarioKey): RoutingDecision[] { return SCENARIOS[scenario].routing; }
}

export const modelRouter = new ModelRouterService();
