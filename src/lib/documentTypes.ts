import { FileText, Scale, Handshake, Heart, BookOpen } from "lucide-react";

export type DocumentCategory = "litigation" | "contract" | "family";

export interface DocumentType {
  id: string;
  name: string;
  category: DocumentCategory;
  categoryLabel: string;
  description: string;
  icon: typeof FileText;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  placeholder: string;
  options?: string[];
}

const partyFields = (prefix: string, label: string): FormField[] => [
  { name: `${prefix}Name`, label: `${label}姓名/名称`, type: "text", required: true, placeholder: `请输入${label}姓名或单位名称` },
  { name: `${prefix}IdNumber`, label: `${label}身份证号/统一社会信用代码`, type: "text", required: false, placeholder: "选填" },
  { name: `${prefix}Address`, label: `${label}住址`, type: "text", required: true, placeholder: `请输入${label}住址` },
  { name: `${prefix}Phone`, label: `${label}联系电话`, type: "text", required: false, placeholder: "选填" },
];

export const documentTypes: DocumentType[] = [
  {
    id: "civil-complaint",
    name: "民事起诉状",
    category: "litigation",
    categoryLabel: "诉讼类",
    description: "用于向法院提起民事诉讼，主张合法权益",
    icon: Scale,
    fields: [
      ...partyFields("plaintiff", "原告"),
      ...partyFields("defendant", "被告"),
      { name: "claims", label: "诉讼请求", type: "textarea", required: true, placeholder: "请逐条列明诉讼请求，如：1. 判令被告偿还借款本金XX元及利息；2. 本案诉讼费用由被告承担。" },
      { name: "factsAndReasons", label: "事实与理由", type: "textarea", required: true, placeholder: "请详细描述案件事实经过及起诉理由" },
      { name: "court", label: "管辖法院", type: "text", required: true, placeholder: "如：北京市朝阳区人民法院" },
      { name: "evidence", label: "证据清单", type: "textarea", required: false, placeholder: "选填，如：1. 借条原件；2. 转账记录" },
    ],
  },
  {
    id: "defense-statement",
    name: "答辩状",
    category: "litigation",
    categoryLabel: "诉讼类",
    description: "被告针对原告起诉进行答辩和反驳",
    icon: FileText,
    fields: [
      ...partyFields("defendant", "答辩人(被告)"),
      ...partyFields("plaintiff", "被答辩人(原告)"),
      { name: "caseNumber", label: "案号", type: "text", required: false, placeholder: "如：(2024)京0105民初12345号" },
      { name: "defensePoints", label: "答辩意见", type: "textarea", required: true, placeholder: "请逐条列明答辩意见和事实依据" },
      { name: "evidence", label: "证据清单", type: "textarea", required: false, placeholder: "选填" },
    ],
  },
  {
    id: "loan-contract",
    name: "借款合同",
    category: "contract",
    categoryLabel: "合同类",
    description: "规范借贷双方的权利义务关系",
    icon: Handshake,
    fields: [
      ...partyFields("lender", "出借人(甲方)"),
      ...partyFields("borrower", "借款人(乙方)"),
      { name: "loanAmount", label: "借款金额（元）", type: "text", required: true, placeholder: "如：100000" },
      { name: "loanPurpose", label: "借款用途", type: "text", required: false, placeholder: "如：经营周转" },
      { name: "interestRate", label: "利率（年利率%）", type: "text", required: true, placeholder: "如：5" },
      { name: "loanTerm", label: "借款期限", type: "text", required: true, placeholder: "如：12个月，自2024年1月1日至2024年12月31日" },
      { name: "repaymentMethod", label: "还款方式", type: "select", required: true, placeholder: "", options: ["到期一次性还本付息", "按月付息到期还本", "等额本息", "等额本金"] },
      { name: "breachClause", label: "违约责任", type: "textarea", required: false, placeholder: "选填，如逾期利率、提前还款条款等" },
      { name: "disputeResolution", label: "争议解决方式", type: "select", required: true, placeholder: "", options: ["协商解决，协商不成向甲方所在地人民法院起诉", "协商解决，协商不成向乙方所在地人民法院起诉", "提交仲裁委员会仲裁"] },
    ],
  },
  {
    id: "rental-contract",
    name: "租赁合同",
    category: "contract",
    categoryLabel: "合同类",
    description: "明确出租方与承租方的租赁权利义务",
    icon: BookOpen,
    fields: [
      ...partyFields("lessor", "出租方(甲方)"),
      ...partyFields("lessee", "承租方(乙方)"),
      { name: "propertyAddress", label: "租赁物地址/描述", type: "text", required: true, placeholder: "如：北京市朝阳区XX路XX号XX室" },
      { name: "rentalTerm", label: "租赁期限", type: "text", required: true, placeholder: "如：2024年1月1日至2025年12月31日" },
      { name: "rent", label: "租金（元/月）", type: "text", required: true, placeholder: "如：5000" },
      { name: "paymentMethod", label: "付款方式", type: "select", required: true, placeholder: "", options: ["押一付一", "押一付三", "押二付一", "年付"] },
      { name: "deposit", label: "押金（元）", type: "text", required: false, placeholder: "如：5000" },
      { name: "specialTerms", label: "特殊约定", type: "textarea", required: false, placeholder: "选填，如装修、转租、维修责任等" },
    ],
  },
  {
    id: "divorce-agreement",
    name: "离婚协议书",
    category: "family",
    categoryLabel: "身份/家事类",
    description: "协议离婚时明确双方权利义务的法律文书",
    icon: Heart,
    fields: [
      ...partyFields("male", "男方"),
      ...partyFields("female", "女方"),
      { name: "marriageDate", label: "结婚登记日期", type: "text", required: true, placeholder: "如：2018年6月1日" },
      { name: "marriagePlace", label: "结婚登记机关", type: "text", required: false, placeholder: "如：北京市朝阳区民政局" },
      { name: "divorceReason", label: "离婚原因", type: "select", required: true, placeholder: "", options: ["感情不和", "性格不合", "长期分居", "家庭暴力", "其他"] },
      { name: "children", label: "子女情况", type: "textarea", required: false, placeholder: "如：婚生子/女XXX，XXXX年X月X日出生，抚养权归XX方，另一方每月支付抚养费XX元" },
      { name: "property", label: "财产分配", type: "textarea", required: true, placeholder: "请详细列明共同财产的分配方案，如房产、存款、车辆等" },
      { name: "debt", label: "债务处理", type: "textarea", required: false, placeholder: "选填，如：双方确认无共同债务" },
    ],
  },
];

export const categories = [
  { id: "litigation" as DocumentCategory, label: "诉讼类", description: "起诉状、答辩状等" },
  { id: "contract" as DocumentCategory, label: "合同类", description: "借款、租赁等合同" },
  { id: "family" as DocumentCategory, label: "身份/家事类", description: "离婚协议等" },
];
