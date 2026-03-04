import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportToPDF } from "@/lib/exportDocument";

describe("exportToPDF", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw when popup is blocked", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    expect(() => exportToPDF("test content", "test title")).toThrow("弹窗被浏览器拦截");
  });

  it("should escape HTML in title to prevent XSS", () => {
    const mockDoc = {
      write: vi.fn(),
      close: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue({ document: mockDoc } as unknown as Window);

    exportToPDF("test content", '<script>alert("xss")</script>');

    const writtenHtml = mockDoc.write.mock.calls[0][0] as string;
    expect(writtenHtml).toContain("<title>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</title>");
    expect(writtenHtml).not.toContain('<title><script>');
  });

  it("should escape HTML in text body", () => {
    const mockDoc = {
      write: vi.fn(),
      close: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue({ document: mockDoc } as unknown as Window);

    exportToPDF('<img src=x onerror=alert(1)>', "safe title");

    const writtenHtml = mockDoc.write.mock.calls[0][0] as string;
    expect(writtenHtml).not.toContain('<img src=x');
    expect(writtenHtml).toContain("&lt;img");
  });

  it("should write proper HTML document structure", () => {
    const mockDoc = {
      write: vi.fn(),
      close: vi.fn(),
    };
    vi.spyOn(window, "open").mockReturnValue({ document: mockDoc } as unknown as Window);

    exportToPDF("民事起诉状内容", "民事起诉状");

    const writtenHtml = mockDoc.write.mock.calls[0][0] as string;
    expect(writtenHtml).toContain("<!DOCTYPE html>");
    expect(writtenHtml).toContain("<title>民事起诉状</title>");
    expect(writtenHtml).toContain("民事起诉状内容");
    expect(mockDoc.close).toHaveBeenCalled();
  });
});
