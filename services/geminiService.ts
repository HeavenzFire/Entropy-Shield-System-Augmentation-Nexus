const LOCAL_MODEL = import.meta.env.VITE_LOCAL_MODEL || "qwen2.5:0.5b";
const LOCAL_CHAT_ENDPOINT = "/api/local-llm/api/chat";

const STRATEGY_SCHEMA = {
  type: "object",
  properties: {
    protocolName: { type: "string" },
    actionSteps: { type: "array", items: { type: "string" } },
    phiAlignment: { type: "number" },
    freedomScore: { type: "number" },
    technicalAbstract: { type: "string" },
    vetoRecommendation: { type: "boolean" }
  },
  required: ["protocolName", "actionSteps", "phiAlignment", "freedomScore", "technicalAbstract", "vetoRecommendation"],
  additionalProperties: false
};

async function localChat(prompt: string, system: string, format?: unknown, numPredict = 768): Promise<string> {
  const response = await fetch(LOCAL_CHAT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LOCAL_MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      stream: false,
      ...(format ? { format } : {}),
      options: { temperature: 0.15, num_predict: numPredict }
    })
  });
  if (!response.ok) throw new Error("Local Ollama request failed with HTTP " + response.status);
  const payload = await response.json();
  const content = payload?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Local model returned an empty response.");
  return content;
}

function clampScore(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error("Model score is not numeric.");
  return Math.max(0, Math.min(1, n));
}

export class GeminiService {
  async getAugmentationStrategy(nodeId: string, nodeType: string, currentEntropy: number) {
    const prompt = [
      "System node " + JSON.stringify(nodeId) + " (" + nodeType + ") reports entropy " + currentEntropy + "%.",
      "Provide a practical, autonomy-preserving Syntropic Binding Protocol. Score it using a transparent heuristic rubric, not a claimed trained neural network.",
      "If the protocol introduces hidden central control, lower freedomScore. If it empowers nodes while preserving explicit safety boundaries, score it higher.",
      "Return only JSON matching this schema: " + JSON.stringify(STRATEGY_SCHEMA)
    ].join("\n\n");
    const system = "You are a local systems-analysis assistant. Distinguish generated estimates from measured facts. Scores are model-generated rubric estimates, not outputs from a trained PyTorch scorer or a physical measurement.";
    try {
      const raw = await localChat(prompt, system, STRATEGY_SCHEMA, 1024);
      const parsed = JSON.parse(raw);
      if (typeof parsed.protocolName !== "string" || !Array.isArray(parsed.actionSteps) || typeof parsed.technicalAbstract !== "string") return null;
      const phiAlignment = clampScore(parsed.phiAlignment);
      const freedomScore = clampScore(parsed.freedomScore);
      return {
        protocolName: parsed.protocolName,
        actionSteps: parsed.actionSteps.filter((step: unknown) => typeof step === "string"),
        phiAlignment,
        freedomScore,
        technicalAbstract: parsed.technicalAbstract,
        vetoRecommendation: parsed.vetoRecommendation === true || freedomScore < 0.65
      };
    } catch (error) {
      console.error("Local protocol generation failed:", error);
      return null;
    }
  }

  async analyzeSystemState(nodes: any[], links: any[]) {
    const prompt = "Analyze this system snapshot: " + JSON.stringify({ nodes, links }) + ". Provide a concise directive about observed entropy versus coherence in at most two sentences. Do not claim measurements beyond the supplied data.";
    try {
      return await localChat(prompt, "You are a concise local systems analyst. Avoid mystical claims as factual measurements.", undefined, 256);
    } catch {
      return "Local inference is unavailable. Recheck the Ollama service and retry.";
    }
  }
}

export const geminiService = new GeminiService();
