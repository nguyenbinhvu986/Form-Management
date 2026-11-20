import type { ApplicationForm } from "./Common";

export const STEP_LABELS = [
  "Thông tin cá nhân",
  "Kinh nghiệm",
  "Kỹ năng & kỳ vọng",
  "Xem lại",
];

export const defaultValues: ApplicationForm = {
  fullName: "",
  email: "",
  phone: "",
  dob: "",
  avatar: null,
  position: "",
  yearsOfExperience: "0",
  portfolioUrl: "",
  workExperience: [],
  skills: [],
  expectedSalary: "",
  workMode: "Onsite",
  timezone: "",
  agreedToTerms: false,
};

export const FIELD_STEP: Record<string, number> = {
  fullName: 0,
  email: 0,
  phone: 0,
  dob: 0,
  avatar: 0,
  position: 1,
  yearsOfExperience: 1,
  portfolioUrl: 1,
  workExperience: 1,
  skills: 2,
  expectedSalary: 2,
  workMode: 2,
  timezone: 2,
  agreedToTerms: 3,
};

export function buildPayload(v: ApplicationForm) {
  const years = Number(v.yearsOfExperience);
  return {
    personalInfo: {
      fullName: v.fullName.trim(),
      email: v.email.trim(),
      phone: v.phone.trim(),
      dob: v.dob,
      avatarName: v.avatar?.name ?? null,
    },
    experience: {
      position: v.position,
      yearsOfExperience: years,
      portfolioUrl: years === 0 ? v.portfolioUrl.trim() : null,
      workExperience:
        years >= 1
          ? v.workExperience.map(
              ({
                companyName,
                role,
                startDate,
                endDate,
                isCurrent,
                description,
              }) => ({
                companyName,
                role,
                startDate,
                endDate: isCurrent ? null : endDate,
                isCurrent,
                description,
              }),
            )
          : [],
    },
    expectations: {
      skills: v.skills,
      expectedSalary: Number(v.expectedSalary),
      workMode: v.workMode,
      timezone: v.workMode === "Remote" ? v.timezone.trim() : null,
    },
    agreedToTerms: v.agreedToTerms,
  };
}
export type ApplicationPayload = ReturnType<typeof buildPayload>;

export class ServerValidationError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super("Server validation failed");
    this.fieldErrors = fieldErrors;
  }
}

export async function submitApplication(
  payload: ApplicationPayload,
): Promise<{ id: string }> {
  await new Promise((r) => setTimeout(r, 1500));
  if (payload.personalInfo.fullName.toLowerCase().includes("error")) {
    throw new ServerValidationError({ fullName: "Máy chủ từ chối họ tên này" });
  }
  return { id: String(Date.now()) };
}
