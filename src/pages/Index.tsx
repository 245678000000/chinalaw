import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Scale, FileText, Handshake, Search, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { documentTypes, categories, type DocumentCategory } from "@/lib/documentTypes";

const categoryIcons: Record<DocumentCategory, typeof Scale> = {
  litigation: Scale,
  contract: Handshake,
  family: FileText,
  corporate: Building2,
};

const COLLAPSED_COUNT = 6;

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<DocumentCategory>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSearching = search.trim().length > 0;

  const filtered = documentTypes.filter((d) => {
    const matchCategory = !activeCategory || d.category === activeCategory;
    const matchSearch = !isSearching || d.name.includes(search.trim()) || d.description.includes(search.trim()) || d.categoryLabel.includes(search.trim());
    return matchCategory && matchSearch;
  });

  const groupedByCategory = useMemo(() => {
    const displayCategories = activeCategory
      ? categories.filter((c) => c.id === activeCategory)
      : categories;

    return displayCategories
      .map((cat) => ({
        ...cat,
        docs: filtered.filter((d) => d.category === cat.id),
      }))
      .filter((g) => g.docs.length > 0);
  }, [filtered, activeCategory]);

  const toggleExpand = (catId: DocumentCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const scrollToCategory = (catId: DocumentCategory) => {
    setActiveCategory(null);
    setTimeout(() => {
      sectionRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const totalCount = documentTypes.length;

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
          <p className="mt-1 text-xs text-muted-foreground">
            已收录 <span className="font-semibold text-foreground">{totalCount}</span> 种文书模板
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

        {/* Category Navigation */}
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
            const count = documentTypes.filter((d) => d.category === cat.id).length;
            return (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => {
                  if (activeCategory === cat.id) {
                    setActiveCategory(null);
                  } else {
                    setActiveCategory(cat.id);
                    scrollToCategory(cat.id);
                  }
                }}
              >
                <Icon className="mr-1 h-3.5 w-3.5" />
                {cat.label}
                <span className="ml-1 text-xs opacity-60">({count})</span>
              </Badge>
            );
          })}
        </div>

        {/* Grouped Sections */}
        {isSearching ? (
          /* Flat grid when searching */
          <div className="mx-auto max-w-5xl">
            {filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">没有找到匹配的文书类型</p>
            ) : (
              <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((doc) => (
                  <DocCard key={doc.id} doc={doc} onNavigate={navigate} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grouped by category */
          <div className="mx-auto max-w-5xl space-y-8">
            {groupedByCategory.map((group) => {
              const Icon = categoryIcons[group.id];
              const isExpanded = expandedCategories.has(group.id);
              const showToggle = group.docs.length > COLLAPSED_COUNT;
              const visibleDocs = showToggle && !isExpanded
                ? group.docs.slice(0, COLLAPSED_COUNT)
                : group.docs;
              const hiddenCount = group.docs.length - COLLAPSED_COUNT;

              return (
                <section
                  key={group.id}
                  ref={(el: HTMLDivElement | null) => { sectionRefs.current[group.id] = el; }}
                  className="scroll-mt-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">({group.docs.length}种)</span>
                    <p className="hidden sm:block text-xs text-muted-foreground ml-1">— {group.description}</p>
                  </div>

                  <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {visibleDocs.map((doc) => (
                      <DocCard key={doc.id} doc={doc} onNavigate={navigate} />
                    ))}
                  </div>

                  {showToggle && (
                    <button
                      onClick={() => toggleExpand(group.id)}
                      className="mt-3 flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors mx-auto"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          收起
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          展开更多（{hiddenCount}种）
                        </>
                      )}
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        )}
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

/* Extracted card component */
function DocCard({ doc, onNavigate }: { doc: typeof documentTypes[number]; onNavigate: (path: string) => void }) {
  const Icon = doc.icon;
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={() => onNavigate(`/generate/${doc.id}`)}
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
}

export default Index;
