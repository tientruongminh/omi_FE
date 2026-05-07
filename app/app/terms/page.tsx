import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | Omilearn",
  description:
    "Điều khoản sử dụng Omilearn cho nền tảng học tập, workspace cộng tác và tích hợp Google Calendar.",
};

const lastUpdated = "07/05/2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-[#2D2D2D] sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-7 text-[#5E5A57] sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div
          className="rounded-[28px] px-6 py-8 sm:px-10 sm:py-10"
          style={{
            background:
              "linear-gradient(135deg, #1F2937 0%, #2D2D2D 48%, #6B2D3E 100%)",
            boxShadow: "0 20px 50px rgba(45, 45, 45, 0.16)",
          }}
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#E6D9D0]">
            Omilearn Legal
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Điều khoản sử dụng
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F3ECE7] sm:text-base">
            Tài liệu này quy định cách người dùng truy cập và sử dụng Omilearn,
            bao gồm các tính năng học tập, workspace cộng tác và kết nối Google
            Calendar.
          </p>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#D9C7BB]">
            Cập nhật lần cuối: {lastUpdated}
          </p>
        </div>

        <div
          className="mt-8 rounded-[28px] border border-[#E7DED6] bg-white px-6 py-8 sm:px-10 sm:py-10"
          style={{ boxShadow: "0 12px 35px rgba(45, 45, 45, 0.06)" }}
        >
          <div className="space-y-9">
            <Section title="1. Chấp nhận điều khoản">
              <p>
                Khi truy cập hoặc sử dụng Omilearn, bạn đồng ý tuân thủ các điều
                khoản sử dụng này và các chính sách liên quan được dẫn chiếu bởi
                nền tảng.
              </p>
            </Section>

            <Section title="2. Tài khoản và quyền truy cập">
              <p>
                Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình và mọi
                hoạt động phát sinh từ tài khoản. Thông tin đăng ký phải chính xác
                và cập nhật.
              </p>
            </Section>

            <Section title="3. Sử dụng nền tảng đúng mục đích">
              <ul className="list-disc space-y-2 pl-5">
                <li>không sử dụng dịch vụ cho mục đích trái pháp luật, gian lận hoặc gây hại,</li>
                <li>không tải lên tài liệu mà bạn không có quyền sử dụng hoặc chia sẻ,</li>
                <li>không cố gắng phá vỡ, khai thác hoặc làm gián đoạn hệ thống,</li>
                <li>không lạm dụng các tính năng cộng tác hoặc đồng bộ lịch.</li>
              </ul>
            </Section>

            <Section title="4. Nội dung học tập và tài liệu người dùng">
              <p>
                Các tài liệu, ghi chú và nội dung học tập được xử lý để phục vụ
                trải nghiệm học tập trên Omilearn. Người dùng chịu trách nhiệm về
                tính hợp pháp, tính chính xác và quyền sử dụng của các nội dung
                mình tải lên hoặc chia sẻ.
              </p>
            </Section>

            <Section title="5. Tích hợp Google Calendar">
              <p>
                Nếu bạn chủ động kết nối Google Calendar, bạn cho phép Omilearn
                truy cập phạm vi dữ liệu cần thiết để hiển thị các lịch đã chọn và
                tạo hoặc cập nhật sự kiện học tập theo thao tác của bạn. Bạn có thể
                thu hồi quyền này trong cài đặt tài khoản Google hoặc trong
                Omilearn nếu tính năng hỗ trợ.
              </p>
            </Section>

            <Section title="6. Tính sẵn sàng của dịch vụ">
              <p>
                Chúng tôi có thể cập nhật, thay đổi, tạm ngưng hoặc dừng một số
                phần của dịch vụ vào từng thời điểm. Omilearn không cam kết mọi
                tính năng luôn hoạt động liên tục không gián đoạn.
              </p>
            </Section>

            <Section title="7. Giới hạn trách nhiệm">
              <p>
                Trong phạm vi pháp luật cho phép, Omilearn không chịu trách nhiệm
                cho các thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc hệ quả phát
                sinh từ việc sử dụng nền tảng hoặc các dịch vụ bên thứ ba được kết
                nối.
              </p>
            </Section>

            <Section title="8. Chấm dứt sử dụng">
              <p>
                Chúng tôi có thể giới hạn, tạm khóa hoặc chấm dứt quyền truy cập
                nếu người dùng vi phạm điều khoản, gây rủi ro bảo mật hoặc ảnh
                hưởng tiêu cực tới nền tảng và cộng đồng sử dụng.
              </p>
            </Section>

            <Section title="9. Liên hệ">
              <p>
                Nếu bạn có câu hỏi pháp lý hoặc cần hỗ trợ, vui lòng liên hệ{" "}
                <a
                  href="mailto:chanelhynvuigames@gmail.com"
                  className="font-semibold text-[#6B2D3E] underline underline-offset-4"
                >
                  chanelhynvuigames@gmail.com
                </a>
                .
              </p>
            </Section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 border-t border-dashed border-[#D6CCC3] pt-6">
            <Link
              href="/landing"
              className="rounded-full border border-[#D6CCC3] px-4 py-2 text-sm font-medium text-[#2D2D2D] transition hover:border-[#6B2D3E] hover:text-[#6B2D3E]"
            >
              Về landing page
            </Link>
            <Link
              href="/privacy"
              className="rounded-full bg-[#6B2D3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#572432]"
            >
              Xem chính sách riêng tư
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
