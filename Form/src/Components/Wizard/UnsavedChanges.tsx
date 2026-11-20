import { useEffect } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import type { ApplicationForm } from "../../types/Common";

export function UnsavedChangesGuard() {
  const { control } = useFormContext<ApplicationForm>();
  const { isDirty } = useFormState({ control });

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  return null;
}
