import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENSITIVE_KEYWORDS = [
  "虚假诉讼", "伪造证据", "高利贷", "赌博", "洗钱", "非法集资",
  "行贿", "受贿", "贩毒", "走私",
];

function buildSystemPrompt(documentName: string): string {
  return `你是一名专业的AI法律文书助手，具备中国法律体系下的文书起草能力。

你的任务是根据用户提供的信息，生成一份规范的"${documentName}"。

要求：
1. 格式规范：严格遵循中国法院或相关机构的官方文书格式，包含标题、当事人信息、正文、落款等完整结构。
2. 语言专业：使用法言法语，准确引用相关法律条文（如《民法典》《民事诉讼法》等具体条款）。
3. 逻辑严谨：事实陈述清晰，法律论证有理有据。
4. 在文书末尾添加分隔线后附加免责声明：
   "【免责声明】本文书为AI生成的参考模板，不构成法律意见。建议在使用前咨询专业律师，根据实际情况调整。"

请直接输出文书全文，不要添加任何额外的说明或对话。`;
}

function buildUserPrompt(
  documentName: string,
  formData: Record<string, string>,
  existingDocument?: string,
  followUpRequest?: string
): string {
  if (existingDocument && followUpRequest) {
    return `以下是之前生成的"${documentName}"：

${existingDocument}

请根据以下修改意见，重新生成完整的文书：
${followUpRequest}

请输出修改后的完整文书。`;
  }

  const fields = Object.entries(formData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  return `请根据以下信息生成一份"${documentName}"：

${fields}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, documentName, formData, existingDocument, followUpRequest } = await req.json();

    if (!documentType || !documentName || !formData) {
      return new Response(JSON.stringify({ error: "缺少必要参数" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sensitive content check
    const allText = Object.values(formData).join(" ") + (followUpRequest || "");
    const found = SENSITIVE_KEYWORDS.find((kw) => allText.includes(kw));
    if (found) {
      return new Response(
        JSON.stringify({ error: `检测到敏感内容（"${found}"），无法生成相关文书。请修改后重试。` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt(documentName) },
          { role: "user", content: buildUserPrompt(documentName, formData, existingDocument, followUpRequest) },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "服务额度已用完" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI生成服务暂时不可用" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
