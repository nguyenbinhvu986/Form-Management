import { Controller, useFormContext } from "react-hook-form";
import { Checkbox, FormControlLabel } from "@mui/material";
import type { ApplicationForm, ItemName } from "../../../types/Common";

export function CurrentCheckbox({ base }: { base: ItemName }) {
  const { control, setValue } = useFormContext<ApplicationForm>();

  return (
    <Controller
      name={`${base}.isCurrent`}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          label="Đang làm việc tại đây"
          control={
            <Checkbox
              checked={field.value}
              slotProps={{ input: { ref: field.ref } }}
              onChange={(e) => {
                field.onChange(e.target.checked);
                setValue(`${base}.endDate`, e.target.checked ? null : "");
              }}
            />
          }
        />
      )}
    />
  );
}
