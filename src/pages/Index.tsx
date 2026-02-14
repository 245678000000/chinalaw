import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Scale, FileText, Handshake, Search, Building2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { documentTypes, categories, type DocumentCategory } from "@/lib/documentTypes";

const categoryIcons: Record<DocumentCategory, typeof Scale> = {
  litigation: Scale,
  contract: Handshake,
  family: FileText,
  corporate: Building2,
};

const categoryColors: Record<DocumentCategory, string> = {
  litigation: "from-blue-500/10 to-blue-600/5 border-blue-200/60",
  contract: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/60",
  family: "from-rose-500/10 to-rose-600/5 border-rose-200/60",
  corporate: "from-amber-500/10 to-amber-600/5 border-amber-200/60",
};

const categoryIconColors: Record<DocumentCategory, string> = {
  litigation: "bg-blue-100 text-blue-600",
  contract: "bg-emerald-100 text-emerald-600",
  family: "bg-rose-100 text-rose-600",
  corporate: "bg-amber-100 text-amber-600",
};

const COLLAPSED_COUNT = 8;

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | null>(null);
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<DocumentCategory>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isSearching = search.trim().length > 0;

  const filtered = documentTypes.filter((d) => {
    const matchCategory = !activeCategory || d.category === activeCategory;
    const matchSearch =
      !isSearching ||
      d.name.includes(search.trim()) ||
      d.description.includes(search.trim()) ||
      d.categoryLabel.includes(search.trim());
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
      <header className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              AI 智能法律文书助手
            </h1>
          </div>
          <p className="text-muted-foreground">
            快速生成规范的法律文书初稿，降低法律服务门槛
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            已收录 <span className="font-semibold text-primary">{totalCount}</span> 种文书模板，覆盖诉讼、合同、家事、商事四大领域
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Quick Start Guide */}
        <div className="mx-auto max-w-3xl mb-8 animate-fade-in">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gradient-to-b from-blue-50 to-transparent border border-blue-100/60">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                1
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-foreground">选择文书类型</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">从下方选择需要的文书模板</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gradient-to-b from-emerald-50 to-transparent border border-emerald-100/60">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                2
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-foreground">填写关键信息</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">按提示填入当事人及案件信息</p>
            </div>
            <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-gradient-to-b from-amber-50 to-transparent border border-amber-100/60">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                3
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-foreground">AI生成文书</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">一键生成，可复制或导出Word/PDF</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto mb-6 max-w-lg relative animate-fade-in">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索文书类型，如：起诉状、合同、离婚..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 text-sm rounded-xl shadow-sm border-border/80 focus-visible:ring-primary/30"
          />
        </div>

        {/* Category Navigation */}
        <div className="mb-8 flex flex-wrap justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Badge
            variant={activeCategory === null ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm transition-all hover:shadow-sm"
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
                className="cursor-pointer px-4 py-2 text-sm transition-all hover:shadow-sm"
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
          <div className="mx-auto max-w-5xl animate-fade-in">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">没有找到匹配的文书类型</p>
                <p className="text-sm text-muted-foreground/60 mt-1">试试其他关键词</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  找到 <span className="font-medium text-foreground">{filtered.length}</span> 种相关文书
                </p>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {filtered.map((doc, i) => (
                    <DocCard key={doc.id} doc={doc} onNavigate={navigate} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-10">
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
                  ref={(el: HTMLDivElement | null) => {
                    sectionRefs.current[group.id] = el;
                  }}
                  className="scroll-mt-4 animate-fade-in-up"
                >
                  {/* Section Header */}
                  <div className={`mb-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r border ${categoryColors[group.id]}`}>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${categoryIconColors[group.id]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground">{group.label}</h2>
                        <span className="text-xs text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
                          {group.docs.length}种
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {visibleDocs.map((doc, i) => (
                      <DocCard key={doc.id} doc={doc} onNavigate={navigate} index={i} />
                    ))}
                  </div>

                  {showToggle && (
                    <button
                      onClick={() => toggleExpand(group.id)}
                      className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mx-auto group"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                          收起
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
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

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-muted/30 py-6 text-center">
        <p className="mx-auto max-w-2xl px-4 text-xs text-muted-foreground leading-relaxed">
          ⚠️ 免责声明：本工具生成的法律文书仅供参考，不构成法律意见。建议在使用前咨询专业律师，根据实际情况调整。本平台不存储用户个人信息。
        </p>
      </footer>
    </div>
  );
};

/* Doc Card */
function DocCard({
  doc,
  onNavigate,
  index,
}: {
  doc: (typeof documentTypes)[number];
  onNavigate: (path: string) => void;
  index: number;
}) {
  const Icon = doc.icon;
  const colors = categoryIconColors[doc.category];

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 group"
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={() => onNavigate(`/generate/${doc.id}`)}
    >
      <CardHeader className="p-3 sm:p-4 pb-1.5 sm:pb-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg ${colors} transition-transform group-hover:scale-110`}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <CardTitle className="text-sm sm:text-base leading-tight">{doc.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
        <CardDescription className="text-xs line-clamp-2">{doc.description}</CardDescription>
      </CardContent>
    </Card>
  );
}

export default Index;
