import { KNOWLEDGE, FINDINGS } from '../data/corpus';
import type { Finding, KnowledgeDoc } from '../types';

class KnowledgeService {
  documents(): KnowledgeDoc[] { return KNOWLEDGE; }
  indexed(): KnowledgeDoc[] { return KNOWLEDGE.filter((d) => d.indexed); }
  passages(): number { return this.indexed().reduce((n, d) => n + d.passages, 0); }

  /** Passages the last inspection run relied on, paired with the finding
   *  that cited them. Source grounding is the point: an answer without a
   *  retrievable clause is a recollection, not a citation. */
  citations(): Finding[] { return FINDINGS; }

  search(query: string): KnowledgeDoc[] {
    const q = query.trim().toLowerCase();
    if (!q) return KNOWLEDGE;
    return KNOWLEDGE.filter(
      (d) => d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.collection.toLowerCase().includes(q),
    );
  }
}

export const knowledge = new KnowledgeService();
