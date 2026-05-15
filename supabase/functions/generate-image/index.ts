// generate-image — chama OpenAI gpt-image-1 OU Replicate FLUX schnell
// Gated por ENABLE_NEW_IA_FLOW=true

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// Cost estimates in cents
const COST = {
  "gpt-image-1": 4,      // ~$0.04 per image (high quality)
  "flux-schnell": 0,     // free tier / ~$0.003 on paid
} as const;

type Model = keyof typeof COST;

async function generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
      output_format: "url",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("No image URL in OpenAI response");
  return url;
}

async function generateWithReplicate(prompt: string, apiKey: string): Promise<string> {
  // Start prediction
  const startRes = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "webp",
        output_quality: 80,
      },
    }),
  });

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`Replicate error: ${err}`);
  }

  const prediction = await startRes.json();

  // If already succeeded (Prefer: wait)
  if (prediction.status === "succeeded") {
    const url = prediction.output?.[0];
    if (!url) throw new Error("No output URL in Replicate response");
    return url;
  }

  // Poll for completion (max 60s)
  const pollUrl = prediction.urls?.get;
  if (!pollUrl) throw new Error("No poll URL from Replicate");

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const pollData = await pollRes.json();
    if (pollData.status === "succeeded") {
      const url = pollData.output?.[0];
      if (!url) throw new Error("No output URL after polling");
      return url;
    }
    if (pollData.status === "failed") {
      throw new Error(`Replicate prediction failed: ${pollData.error}`);
    }
  }

  throw new Error("Replicate prediction timed out");
}

async function updateGenerationRecord(
  generationId: string,
  updates: Record<string, unknown>,
) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) return;

  await fetch(`${SUPABASE_URL}/rest/v1/ai_generations?id=eq.${generationId}`, {
    method: "PATCH",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(updates),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (Deno.env.get("ENABLE_NEW_IA_FLOW") !== "true") {
    return json({ error: "feature_disabled" }, 503);
  }

  let prompt = "";
  let model: Model = "flux-schnell";
  let generationId: string | undefined;

  try {
    const body = await req.json();
    prompt = body.prompt;
    model = (body.model as Model) ?? "flux-schnell";
    generationId = body.generationId;
  } catch {
    return json({ error: "invalid_body" }, 400);
  }

  if (!prompt) return json({ error: "prompt required" }, 400);
  if (!["gpt-image-1", "flux-schnell"].includes(model)) {
    return json({ error: "invalid model" }, 400);
  }

  // Mark as processing
  if (generationId) {
    await updateGenerationRecord(generationId, { status: "processing", model });
  }

  try {
    let imageUrl: string;

    if (model === "gpt-image-1") {
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) return json({ error: "OPENAI_API_KEY not set" }, 500);
      imageUrl = await generateWithOpenAI(prompt, apiKey);
    } else {
      const apiKey = Deno.env.get("REPLICATE_API_TOKEN");
      if (!apiKey) return json({ error: "REPLICATE_API_TOKEN not set" }, 500);
      imageUrl = await generateWithReplicate(prompt, apiKey);
    }

    const costCents = COST[model];

    if (generationId) {
      await updateGenerationRecord(generationId, {
        status: "done",
        image_url: imageUrl,
        cost_cents: costCents,
        model,
      });
    }

    return json({ imageUrl, model, costCents });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (generationId) {
      await updateGenerationRecord(generationId, {
        status: "failed",
        error_message: message,
      });
    }

    return json({ error: "generation_failed", detail: message }, 502);
  }
});
