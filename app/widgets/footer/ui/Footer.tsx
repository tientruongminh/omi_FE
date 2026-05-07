import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: "#FAF9F7" }}>
      <div className="border-t-2 border-dashed border-[#CCCCCC]" />

      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-medium lowercase text-[#6B2D3E]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: "italic",
            }}
          >
            omilearn
          </span>
          <span className="text-sm text-[#2D2D2D]">© 2025 Editorial Learning</span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-[#2D2D2D] transition-colors hover:text-[#6B2D3E]"
          >
            Quyền riêng tư
          </Link>
          <Link
            href="/terms"
            className="text-sm text-[#2D2D2D] transition-colors hover:text-[#6B2D3E]"
          >
            Điều khoản
          </Link>
          <Link
            href="/landing#faq"
            className="text-sm text-[#2D2D2D] transition-colors hover:text-[#6B2D3E]"
          >
            Trợ giúp
          </Link>
        </div>
      </div>
    </footer>
  );
}
