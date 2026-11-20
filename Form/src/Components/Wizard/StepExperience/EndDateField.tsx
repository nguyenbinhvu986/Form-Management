import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TextField } from "@mui/material";
import type { ApplicationForm, ItemName } from "../../../types/Common";
import { errMsg, fieldId } from "../FormTextField";

export function EndDateField({ base }: { base: ItemName }) {
  const { control } = useFormContext<ApplicationForm>();
  const isCurrent = useWatch({ control, name: `${base}.isCurrent` });

  return (
    <Controller
      name={`${base}.endDate`}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          id={fieldId(field.name)}
          label="Ngày kết thúc"
          type="month"
          size="small"
          fullWidth
          disabled={isCurrent}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          error={!!fieldState.error}
          helperText={errMsg(fieldState.error)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      )}
    />
  );
}
