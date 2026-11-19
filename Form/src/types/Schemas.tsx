import { z } from "zod";
import { EMAIL_RE, LEVELS, WORK_MODES } from "./Common";
import { isEmailKnownTaken } from "./EmailCheck";

const isValidUrl = (s: string) => {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const isAdult = (dob: string) => {
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return false;
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d))
    age--;
  return age >= 18;
};

export const personalSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .min(3, "Họ và tên tối thiểu 3 ký tự")
    .regex(/^[\p{L}\s]+$/u, "Họ và tên không được chứa số hoặc ký tự đặc biệt"),
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .regex(EMAIL_RE, "Email không đúng định dạng")
    .refine((v) => !isEmailKnownTaken(v), "Email này đã được sử dụng"),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(
      /^(0|\+84)[35789][0-9]{8}$/,
      "Số điện thoại không hợp lệ (VD: 0912345678)",
    ),
  dob: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh")
    .refine((v) => !v || isAdult(v), "Ứng viên phải từ đủ 18 tuổi"),
  avatar: z
    .custom<File | null>()
    .refine(
      (f) => !f || ["image/jpeg", "image/png", "image/webp"].includes(f.type),
      "Chỉ nhận ảnh .jpg, .png, .webp",
    )
    .refine((f) => !f || f.size <= 2 * 1024 * 1024, "Ảnh tối đa 2MB"),
});

export const experienceSchema = z
  .object({
    position: z.string().min(1, "Vui lòng chọn vị trí ứng tuyển"),
    yearsOfExperience: z.string(),
    portfolioUrl: z.string(),
    workExperience: z.array(
      z.object({
        companyName: z.string(),
        role: z.string(),
        startDate: z.string(),
        isCurrent: z.boolean(),
        endDate: z.string().nullable(),
        description: z.string(),
      }),
    ),
  })
  .superRefine((v, ctx) => {
    const add = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", message, path });
    const raw = v.yearsOfExperience.trim();
    const years = Number(raw);

    if (raw === "" || !Number.isInteger(years) || years < 0 || years > 30) {
      add(
        ["yearsOfExperience"],
        "Số năm kinh nghiệm phải là số nguyên từ 0 đến 30",
      );
      return;
    }
    if (years === 0) {
      if (!v.portfolioUrl.trim())
        add(["portfolioUrl"], "Vui lòng nhập link đồ án tốt nghiệp / Github");
      else if (!isValidUrl(v.portfolioUrl))
        add(["portfolioUrl"], "Link không đúng định dạng URL (https://...)");
      return;
    }
    if (v.workExperience.length < 1) {
      add(["workExperience"], "Cần ít nhất 1 mục lịch sử làm việc");
      return;
    }
    v.workExperience.forEach((w, i) => {
      const p = (f: string) => ["workExperience", i, f];
      if (!w.companyName.trim()) add(p("companyName"), "Nhập tên công ty");
      if (!w.role.trim()) add(p("role"), "Nhập vị trí");
      if (!/^\d{4}-\d{2}$/.test(w.startDate))
        add(p("startDate"), "Chọn ngày bắt đầu");
      if (!w.isCurrent) {
        if (!w.endDate) add(p("endDate"), "Chọn ngày kết thúc");
        else if (w.startDate && w.endDate <= w.startDate)
          add(p("endDate"), "Ngày kết thúc phải sau ngày bắt đầu");
      }
      if (w.description.length > 500) add(p("description"), "Tối đa 500 ký tự");
    });
  });

export const skillsSchema = z
  .object({
    skills: z
      .array(z.object({ name: z.string(), level: z.enum(LEVELS) }))
      .min(3, "Chọn tối thiểu 3 kỹ năng"),
    expectedSalary: z.string(),
    workMode: z.enum(WORK_MODES),
    timezone: z.string(),
  })
  .superRefine((v, ctx) => {
    const add = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", message, path: [path] });
    const salary = Number(v.expectedSalary);
    if (!v.expectedSalary)
      add("expectedSalary", "Vui lòng nhập mức lương kỳ vọng");
    else if (salary < 5000000 || salary > 200000000)
      add("expectedSalary", "Mức lương từ 5,000,000 đến 200,000,000 VNĐ");
    if (v.workMode === "Remote" && !v.timezone.trim())
      add("timezone", "Vui lòng nhập múi giờ làm việc");
  });

export const reviewSchema = z.object({
  agreedToTerms: z
    .boolean()
    .refine((v) => v === true, "Bạn cần cam kết thông tin là chính xác"),
});
