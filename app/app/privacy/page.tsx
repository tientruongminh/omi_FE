import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư | Omilearn",
  description:
    "Chính sách quyền riêng tư của Omilearn, bao gồm dữ liệu học tập và tích hợp Google Calendar.",
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div
          className="rounded-[28px] px-6 py-8 sm:px-10 sm:py-10"
          style={{
            background:
              "linear-gradient(135deg, #6B2D3E 0%, #8C4B5D 45%, #A36A52 100%)",
            boxShadow: "0 20px 50px rgba(107, 45, 62, 0.18)",
          }}
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F5E6D9]">
            Omilearn Legal
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Chính sách quyền riêng tư
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F8EDE5] sm:text-base">
            Tài liệu này mô tả Omilearn thu thập dữ liệu nào, cách chúng tôi sử
            dụng dữ liệu đó, và cách dữ liệu được bảo vệ khi người dùng học tập,
            cộng tác và kết nối với các dịch vụ như Google Calendar.
          </p>
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-[#F5D9C7]">
            Cập nhật lần cuối: {lastUpdated}
          </p>
        </div>

        <div
          className="mt-8 rounded-[28px] border border-[#E7DED6] bg-white px-6 py-8 sm:px-10 sm:py-10"
          style={{ boxShadow: "0 12px 35px rgba(45, 45, 45, 0.06)" }}
        >
          <div className="space-y-9">
            <Section title="1. Dữ liệu chúng tôi thu thập">
              <p>
                Omilearn có thể thu thập các thông tin như họ tên, email, ảnh đại
                diện, hoạt động học tập, ghi chú, tài liệu người dùng tải lên và
                các tương tác trong workspace để cung cấp dịch vụ học tập và cộng
                tác.
              </p>
              <p>
                Khi người dùng kết nối Google Calendar, Omilearn có thể truy cập
                thông tin lịch và sự kiện cần thiết để hiển thị các lịch hiện có
                hoặc tạo sự kiện học tập theo đúng yêu cầu của người dùng.
              </p>
            </Section>

            <Section title="2. Mục đích sử dụng dữ liệu">
              <ul className="list-disc space-y-2 pl-5">
                <li>tạo và quản lý tài khoản người dùng,</li>
                <li>cung cấp roadmap, workspace và tiến trình học tập,</li>
                <li>hỗ trợ cộng tác và đồng bộ lịch học,</li>
                <li>tạo hoặc cập nhật sự kiện trên Google Calendar khi người dùng yêu cầu,</li>
                <li>cải thiện tính ổn định, bảo mật và chất lượng sản phẩm.</li>
              </ul>
            </Section>

            <Section title="3. Dữ liệu Google Calendar">
              <p>
                Nếu bạn cấp quyền kết nối Google Calendar, Omilearn chỉ sử dụng
                quyền đó để đọc các lịch mà bạn cho phép kết nối và để tạo, chỉnh
                sửa hoặc hiển thị các sự kiện học tập liên quan đến trải nghiệm sử
                dụng Omilearn.
              </p>
              <p>
                Omilearn không bán dữ liệu Google của người dùng và không sử dụng
                dữ liệu đó cho mục đích quảng cáo.
              </p>
            </Section>

            <Section title="4. Lưu trữ và bảo mật">
              <p>
                Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức hợp lý để bảo
                vệ dữ liệu khỏi truy cập trái phép, thất thoát, lạm dụng hoặc tiết
                lộ không phù hợp. Quyền truy cập vào dữ liệu tích hợp được giới hạn
                ở mức cần thiết để vận hành dịch vụ.
              </p>
            </Section>

            <Section title="5. Thời gian lưu trữ">
              <p>
                Dữ liệu được lưu trữ trong thời gian cần thiết để cung cấp dịch vụ,
                tuân thủ nghĩa vụ pháp lý, giải quyết tranh chấp và thực thi các
                thỏa thuận liên quan. Người dùng có thể yêu cầu ngắt kết nối các
                dịch vụ bên thứ ba hoặc yêu cầu xóa dữ liệu theo quy trình hỗ trợ
                phù hợp.
              </p>
            </Section>

            <Section title="6. Dịch vụ bên thứ ba">
              <p>
                Omilearn có thể tích hợp với các dịch vụ như Google. Các dịch vụ
                đó có chính sách riêng của họ và người dùng nên đọc kỹ trước khi
                kết nối tài khoản ngoài.
              </p>
            </Section>

            <Section title="7. Quyền của người dùng">
              <p>
                Người dùng có thể yêu cầu truy cập, chỉnh sửa, xóa dữ liệu hoặc
                hủy liên kết Google Calendar bằng cách liên hệ email hỗ trợ bên
                dưới.
              </p>
            </Section>

            <Section title="8. Liên hệ">
              <p>
                Nếu bạn có câu hỏi về quyền riêng tư hoặc muốn xử lý dữ liệu cá
                nhân, vui lòng liên hệ{" "}
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
              href="/terms"
              className="rounded-full bg-[#6B2D3E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#572432]"
            >
              Xem điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
