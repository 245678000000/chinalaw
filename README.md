# AI 智能法律文书助手

快速生成规范的法律文书初稿，降低法律服务门槛。已收录 42 种文书模板，覆盖诉讼、合同、家事、商事四大领域。

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5 (SWC)
- **UI 组件**: shadcn/ui (Radix UI)
- **样式**: Tailwind CSS 3
- **路由**: React Router 6
- **状态**: TanStack React Query 5
- **AI 后端**: Supabase Edge Functions
- **测试**: Vitest + React Testing Library
- **文档导出**: docx (Word) + 浏览器打印 (PDF)

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 Supabase 凭证

# 3. 启动开发服务器（端口 8080）
npm run dev
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 8080） |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run preview` | 预览生产构建 |

## 项目结构

```
src/
├── components/ui/    # shadcn/ui 组件库
├── hooks/            # 自定义 Hooks
├── integrations/     # Supabase 集成
├── lib/
│   ├── documentTypes.ts   # 42 种文书类型定义
│   ├── exportDocument.ts  # Word/PDF 导出
│   └── utils.ts           # 工具函数
├── pages/
│   ├── Index.tsx             # 首页 - 文书类型选择
│   ├── GenerateDocument.tsx  # 表单 + AI 生成 + 预览
│   └── NotFound.tsx          # 404 页
└── test/             # 测试文件
```

## 免责声明

本工具生成的法律文书仅供参考，不构成法律意见。建议在使用前咨询专业律师。
