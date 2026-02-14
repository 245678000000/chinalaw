import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { documentTypes } from "@/lib/documentTypes";

const GenerateDocument = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const docType = documentTypes.find((d) => d.id === typeId);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"form" | "result">("form");
  const [followUp, setFollowUp] = useState("");
  const [isFollowingUp, setIsFollowingUp] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  if (!docType) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">未找到该文书类型</p>
          <Button variant="link" onClick={() => navigate("/")}>返回首页</Button>
        </div>
      </div>
    );
  }

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const missing = docType.fields.filter((f) => f.required && !formData[f.name]?.trim());
    if (missing.length > 0) {
      toast({
        title: "请填写必填项",
        description: `以下字段为必填：${missing.map((f) => f.label).join("、")}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const streamGenerate = async (endpoint: string, body: object) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const resp = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      let msg = "生成失败，请稍后重试";
      if (resp.status === 429) msg = "请求过于频繁，请稍后再试";
      if (resp.status === 402) msg = "服务额度已用完，请联系管理员";
      throw new Error(msg);
    }

    return resp;
  };

  const processStream = async (resp: Response, onDelta: (text: string) => void) => {
    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;
    setIsGenerating(true);
    setGeneratedText("");
    setStep("result");

    try {
      const resp = await streamGenerate("generate-document", {
        documentType: docType.id,
        documentName: docType.name,
        formData,
      });

      let fullText = "";
      await processStream(resp, (chunk) => {
        fullText += chunk;
        setGeneratedText(fullText);
      });
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ title: "生成失败", description: e.message, variant: "destructive" });
        setStep("form");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUp.trim()) return;
    setIsFollowingUp(true);

    try {
      const resp = await streamGenerate("generate-document", {
        documentType: docType.id,
        documentName: docType.name,
        formData,
        existingDocument: generatedText,
        followUpRequest: followUp.trim(),
      });

      let fullText = "";
      setGeneratedText("");
      await processStream(resp, (chunk) => {
        fullText += chunk;
        setGeneratedText(fullText);
      });
      setFollowUp("");
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast({ title: "修改失败", description: e.message, variant: "destructive" });
      }
    } finally {
      setIsFollowingUp(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast({ title: "已复制到剪贴板" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{docType.name}</h1>
            <p className="text-sm text-muted-foreground">{docType.description}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {step === "form" ? (
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg">请填写文书信息</CardTitle>
              <p className="text-sm text-muted-foreground">带 * 的为必填项</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {docType.fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  {field.type === "select" ? (
                    <Select
                      value={formData[field.name] || ""}
                      onValueChange={(v) => handleFieldChange(field.name, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <Button className="mt-6 w-full" size="lg" onClick={handleGenerate}>
                生成文书
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {/* Result area */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">文书预览</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setStep("form"); setGeneratedText(""); }}>
                    重新填写
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy} disabled={!generatedText || isGenerating}>
                    {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                    {copied ? "已复制" : "复制全文"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[60vh]">
                  {isGenerating && !generatedText && (
                    <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>正在生成文书...</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedText}
                    {isGenerating && generatedText && <span className="inline-block h-4 w-1 animate-pulse bg-primary" />}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Follow-up input */}
            {!isGenerating && generatedText && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入修改意见，如：把违约金比例改为10%"
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !isFollowingUp && handleFollowUp()}
                      disabled={isFollowingUp}
                    />
                    <Button onClick={handleFollowUp} disabled={isFollowingUp || !followUp.trim()}>
                      {isFollowingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <footer className="mt-8 border-t border-border bg-muted/50 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          ⚠️ 本文书为AI生成的参考模板，不构成法律意见。请咨询专业律师后使用。
        </p>
      </footer>
    </div>
  );
};

export default GenerateDocument;
