import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Scale, FileText, Handshake, Search } from "lucide-react";
import { documentTypes, categories, type DocumentCategory } from "@/lib/documentTypes";

const categoryIcons: Record<DocumentCategory, typeof Scale> = {
  litigation: Scale,
  contract: Handshake,
  family: FileText,
};

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [search, setSearch] = useState("");

  const filtered = documentTypes.filter((d) => {
    const matchCategory = !activeCategory || d.category === activeCategory;
    const matchSearch = !search.trim() || d.name.includes(search.trim()) || d.description.includes(search.trim()) || d.categoryLabel.includes(search.trim());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            AI 智能法律文书助手
          </h1>
          <p className="mt-2 text-muted-foreground">
            快速生成规范的法律文书初稿，降低法律服务门槛
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mx-auto mb-6 max-w-md relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索文书类型，如：起诉状、合同、离婚..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <Badge
            variant={activeCategory === null ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setActiveCategory(null)}
          >
            全部
          </Badge>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id];
            return (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setActiveCategory(cat.id)}
              >
                <Icon className="mr-1 h-3.5 w-3.5" />
                {cat.label}
              </Badge>
            );
          })}
        </div>

        {/* Document Cards */}
        <div className="mx-auto grid max-w-5xl gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((doc) => {
            const Icon = doc.icon;
            return (
              <Card
                key={doc.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                onClick={() => navigate(`/generate/${doc.id}`)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-base leading-tight">{doc.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <CardDescription className="text-xs">{doc.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="mt-12 border-t border-border bg-muted/50 py-6 text-center">
        <p className="mx-auto max-w-2xl px-4 text-xs text-muted-foreground">
          ⚠️ 免责声明：本工具生成的法律文书仅供参考，不构成法律意见。建议在使用前咨询专业律师，根据实际情况调整。本平台不存储用户个人信息。
        </p>
      </footer>
    </div>
  );
};

export default Index;
