import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { checkEmailTaken } from "../../../types/EmailCheck";
import { isEmailFormat } from "../../../types/Common";
import type { ApplicationForm } from "../../../types/Common";
import { FormTextField } from "../FormTextField";

export function EmailField() {
  const { control, trigger } = useFormContext<ApplicationForm>();
  const email = useWatch({ control, name: "email" });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isEmailFormat(email)) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      await checkEmailTaken(email);
      if (cancelled) return;
      setChecking(false);
      void trigger("email");
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [email, trigger]);

  return (
    <FormTextField
      name="email"
      label="Email"
      autoComplete="email"
      helperText={checking ? "Đang kiểm tra email…" : undefined}
    />
  );
}
