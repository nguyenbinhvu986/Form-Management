import { Controller, useFormContext } from "react-hook-form";
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LEVELS, WORK_MODES, formatVnd } from "../../types/Common";
import { SKILL_SUGGESTIONS } from "../../types/Skills";
import type { ApplicationForm } from "../../types/Common";
import type { Level } from "../../types/Skills";
import { errMsg, useTextField } from "../Hooks/useTextField";

export function StepSkills() {
  const { control, watch } = useFormContext<ApplicationForm>();
  const tf = useTextField();
  const workMode = watch("workMode");

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">Kỹ năng & kỳ vọng</Typography>

      {/* Kỹ năng: chọn từ gợi ý hoặc tự gõ thêm, mỗi kỹ năng có mức thành thạo */}
      <Controller
        name="skills"
        control={control}
        render={({ field, fieldState }) => {
          const skills = field.value;
          return (
            <Stack spacing={1.5}>
              <Autocomplete
                multiple
                freeSolo
                options={SKILL_SUGGESTIONS}
                value={skills.map((s) => s.name)}
                onBlur={field.onBlur}
                onChange={(_, names) => {
                  const unique = Array.from(
                    new Set(names.map((n) => n.trim()).filter(Boolean)),
                  );
                  field.onChange(
                    unique.map(
                      (n) =>
                        skills.find((s) => s.name === n) ?? {
                          name: n,
                          level: "Beginner" as Level,
                        },
                    ),
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Kỹ năng (chọn hoặc gõ rồi Enter)"
                    error={!!fieldState.error}
                    helperText={
                      errMsg(fieldState.error) ??
                      `Đã chọn ${skills.length}, cần tối thiểu 3`
                    }
                  />
                )}
              />
              {skills.map((s, i) => (
                <Stack
                  key={s.name}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Typography sx={{ flex: 1 }}>{s.name}</Typography>
                  <TextField
                    select
                    size="small"
                    label="Mức độ"
                    value={s.level}
                    sx={{ minWidth: 160 }}
                    onChange={(e) =>
                      field.onChange(
                        skills.map((x, j) =>
                          j === i
                            ? { ...x, level: e.target.value as Level }
                            : x,
                        ),
                      )
                    }
                  >
                    {LEVELS.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              ))}
            </Stack>
          );
        }}
      />

      {/* Mức lương: tự định dạng 25,000,000 khi gõ, state chỉ lưu chữ số */}
      <Controller
        name="expectedSalary"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="Mức lương kỳ vọng"
            size="small"
            fullWidth
            placeholder="25,000,000"
            value={formatVnd(field.value)}
            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            helperText={
              errMsg(fieldState.error) ?? "Từ 5,000,000 đến 200,000,000 VNĐ"
            }
            slotProps={{
              input: {
                endAdornment: (
                  <Typography color="text.secondary">VNĐ</Typography>
                ),
              },
            }}
          />
        )}
      />

      <Controller
        name="workMode"
        control={control}
        render={({ field }) => (
          <FormControl>
            <FormLabel>Hình thức làm việc</FormLabel>
            <RadioGroup row value={field.value} onChange={field.onChange}>
              {WORK_MODES.map((m) => (
                <FormControlLabel
                  key={m}
                  value={m}
                  control={<Radio />}
                  label={m}
                />
              ))}
            </RadioGroup>
            <FormHelperText> </FormHelperText>
          </FormControl>
        )}
      />

      {workMode === "Remote" && (
        <TextField
          label="Múi giờ làm việc"
          placeholder="Asia/Ho_Chi_Minh hoặc UTC+7"
          {...tf("timezone")}
        />
      )}
    </Stack>
  );
}
