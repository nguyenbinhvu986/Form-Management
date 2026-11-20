import { get, useFormContext, useFormState } from "react-hook-form";
import type { Path } from "react-hook-form";
import { TextField } from "@mui/material";
import type { OutlinedTextFieldProps } from "@mui/material";
import type { ApplicationForm } from "../../types/Common";

export function errMsg(err: unknown): string | undefined {
  const e = err as
    | { message?: string; root?: { message?: string } }
    | undefined;
  return e?.message ?? e?.root?.message;
}

export const fieldId = (name: string) => name.replace(/\./g, "-");

type Props = Omit<OutlinedTextFieldProps, "name" | "variant"> & {
  name: Path<ApplicationForm>;
  hint?: string;
};

export function FormTextField({ name, hint, helperText, ...props }: Props) {
  const { register, control } = useFormContext<ApplicationForm>();
  const { errors } = useFormState({ control, name });
  const { ref, ...field } = register(name);
  const message = errMsg(get(errors, name));

  return (
    <TextField
      {...field}
      id={fieldId(name)}
      inputRef={ref}
      error={Boolean(message)}
      helperText={
        helperText ?? ([message, hint].filter(Boolean).join(" · ") || undefined)
      }
      fullWidth
      size="small"
      {...props}
    />
  );
}
