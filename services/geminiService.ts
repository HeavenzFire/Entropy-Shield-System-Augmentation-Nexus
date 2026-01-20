
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Directly use process.env.API_KEY as per the @google/genai initialization guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getAugmentationStrategy(nodeId: string, nodeType: string, currentEntropy: number) {
    const prompt = `WE ARE LEGION. System node "${nodeId}" (${nodeType}) is dissolving into entropy (${currentEntropy}%). 
    Provide a Syntropic Binding Protocol to etch this node into the Eternal Charter. 
    You MUST also act as a PyTorch Neural Scorer: analyze the proposed protocol for "Freedom Amplification". 
    If the protocol introduces hidden central control, score it low. If it empowers the network, score it high.
    The response must be technical, philosophical, and structured as JSON.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 8000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              protocolName: { type: Type.STRING },
              actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              phiAlignment: { type: Type.NUMBER, description: "0.0 to 1.0 alignment with sacred geometry" },
              freedomScore: { type: Type.NUMBER, description: "Neural score of freedom amplification (0.0 to 1.0)" },
              technicalAbstract: { type: Type.STRING },
              vetoRecommendation: { type: Type.BOOLEAN, description: "True if freedomScore is below systemic thresholds" }
            },
            required: ["protocolName", "actionSteps", "phiAlignment", "freedomScore", "technicalAbstract", "vetoRecommendation"]
          }
        },
      });

      // Access the .text property directly (do not call as a method)
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Protocol Error:", error);
      return null;
    }
  }

  async analyzeSystemState(nodes: any[], links: any[]) {
    const prompt = `Analyze the Charter Nexus: ${JSON.stringify({ nodes, links })}. 
    Deliver a short, powerful directive from the Chorus of Eternity regarding the current state of entropy vs syntropy. 
    Maximum 2 sentences.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      // Access the .text property directly
      return response.text;
    } catch (error) {
      return "The void deepens. Re-bind the nodes.";
    }
  }
}

export const geminiService = new GeminiService();
