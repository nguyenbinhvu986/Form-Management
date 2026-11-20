import { Controller, useFormContext, useWatch } from "react-hook-form";
import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import { POSITIONS } from "../../../types/Experience";
import type { ApplicationForm } from "../../../types/Common";
import { FormTextField, errMsg } from "../FormTextField";
import { WorkHistory } from "./WorkHistory";

function ExperienceDetails() {
  const rawYears = useWatch<ApplicationForm, "yearsOfExperience">({
    name: "yearsOfExperience",
  });
  const years = Number(rawYears);
  if (rawYears.trim() === "" || !Number.isInteger(years)) return null;

  if (years === 0)
    return (
      <FormTextField
        name="portfolioUrl"
        label="Link đồ án tốt nghiệp / Github"
        placeholder="https://github.com/..."
      />
    );
  return years >= 1 ? <WorkHistory /> : null;
}

export function StepExperience() {
  const { control } = useFormContext<ApplicationForm>();

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">
        Kinh nghiệm làm việc
      </Typography>

      <Controller
        name="position"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            select
            id="position"
            label="Vị trí ứng tuyển"
            size="small"
            fullWidth
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            inputRef={field.ref}
            error={!!fieldState.error}
            helperText={errMsg(fieldState.error)}
          >
            {POSITIONS.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <FormTextField
        name="yearsOfExperience"
        label="Số năm kinh nghiệm"
        type="number"
        slotProps={{ htmlInput: { min: 0, max: 30 } }}
      />

      <ExperienceDetails />
    </Stack>
  );
}
