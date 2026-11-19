import { get, useFormContext } from "react-hook-form";
import type { Path } from "react-hook-form";
import type { ApplicationForm } from "../../types/Common";

// Lỗi ở cấp mảng có thể nằm ở .message hoặc .root.message tùy loại field
export function errMsg(err: unknown): string | undefined {
  const e = err as
    | { message?: string; root?: { message?: string } }
    | undefined;
  return e?.message ?? e?.root?.message;
}

// Dùng: <TextField label="..." {...tf("fullName")} />
export function useTextField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicationForm>();

  return (name: Path<ApplicationForm>) => {
    const { ref, ...rest } = register(name);
    const message = errMsg(get(errors, name));
    return {
      ...rest,
      inputRef: ref, // MUI cần inputRef để RHF gán giá trị ban đầu
      error: Boolean(message),
      helperText: message,
      fullWidth: true,
      size: "small" as const,
    };
  };
}
