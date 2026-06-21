"use client";

import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Download, Edit, Loader2, Monitor, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const CoverLetterPreview = ({ content: initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState("preview"); // "preview" | "edit"
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.getElementById("cover-letter-pdf");
      if (!element) {
        throw new Error("Cover letter preview element not found");
      }

      const opt = {
        margin: [15, 15],
        filename: "cover-letter.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div data-color-mode="dark" className="space-y-4 py-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode(mode === "preview" ? "edit" : "preview")}
          className="gap-2"
        >
          {mode === "preview" ? (
            <>
              <Edit className="h-4 w-4" />
              Edit Markdown
            </>
          ) : (
            <>
              <Monitor className="h-4 w-4" />
              Show Preview
            </>
          )}
        </Button>

        <Button
          size="sm"
          onClick={generatePDF}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Edit mode warning */}
      {mode === "edit" && (
        <div className="flex items-center gap-2 p-3 border-2 border-yellow-600 text-yellow-500 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>You are editing the raw markdown. Changes are local only.</span>
        </div>
      )}

      {/* Editor */}
      <div className="border rounded-lg overflow-hidden">
        <MDEditor
          value={content}
          onChange={setContent}
          height={750}
          preview={mode}
        />
      </div>

      {/* Hidden PDF target */}
      <div className="hidden">
        <div id="cover-letter-pdf">
          <MDEditor.Markdown
            source={content}
            style={{ background: "white", color: "black", padding: "16px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;