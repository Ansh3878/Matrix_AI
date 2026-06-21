import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  return (
    <div className="container mx-auto px-4 py-4 max-w-5xl">
      {/* Back navigation */}
      <Link href="/ai-cover-letter">
        <Button variant="link" className="gap-2 pl-0 mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Cover Letters
        </Button>
      </Link>

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold gradient-title mb-2">
        {coverLetter?.jobTitle} at {coverLetter?.companyName}
      </h1>

      {/* Editor / Preview */}
      <CoverLetterPreview content={coverLetter?.content} />
    </div>
  );
}