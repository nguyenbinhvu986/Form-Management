import { useFormContext, useWatch } from "react-hook-form";
import type { ApplicationForm, ItemName } from "../../../types/Common";
import { FormTextField } from "../FormTextField";

export function DescriptionField({ base }: { base: ItemName }) {
  const { control } = useFormContext<ApplicationForm>();
  const description = useWatch({ control, name: `${base}.description` }) ?? "";

  return (
    <FormTextField
      name={`${base}.description`}
      label="Mô tả công việc"
      multiline
      minRows={3}
      slotProps={{ htmlInput: { maxLength: 500 } }}
      hint={`${description.length}/500 ký tự`}
    />
  );
}
