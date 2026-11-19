import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { POSITIONS } from "../../types/Experience";
import type { ApplicationForm } from "../../types/Common";
import { errMsg, useTextField } from "../Hooks/useTextField";

const EMPTY_ITEM: ApplicationForm["workExperience"][number] = {
  companyName: "",
  role: "",
  startDate: "",
  isCurrent: false,
  endDate: "",
  description: "",
};

/* ----- Một mục công ty ----- */
function ExperienceItem({
  index,
  total,
  onRemove,
  onMove,
}: {
  index: number;
  total: number;
  onRemove: () => void;
  onMove: (to: number) => void;
}) {
  const { control, setValue } = useFormContext<ApplicationForm>();
  const tf = useTextField();
  const base = `workExperience.${index}` as const;

  const isCurrent = useWatch({ control, name: `${base}.isCurrent` });
  const description = useWatch({ control, name: `${base}.description` }) ?? "";
  const descProps = tf(`${base}.description`);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight={600}>Công ty {index + 1}</Typography>
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              disabled={index === 0}
              onClick={() => onMove(index - 1)}
              aria-label="Đưa lên"
            >
              ↑
            </Button>
            <Button
              size="small"
              disabled={index === total - 1}
              onClick={() => onMove(index + 1)}
              aria-label="Đưa xuống"
            >
              ↓
            </Button>
            <Button size="small" color="error" onClick={onRemove}>
              Xóa
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <TextField label="Tên công ty" {...tf(`${base}.companyName`)} />
          <TextField label="Vị trí" {...tf(`${base}.role`)} />
          <TextField
            label="Ngày bắt đầu"
            type="month"
            slotProps={{ inputLabel: { shrink: true } }}
            {...tf(`${base}.startDate`)}
          />
          <Controller
            name={`${base}.endDate`}
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                label="Ngày kết thúc"
                type="month"
                size="small"
                fullWidth
                disabled={isCurrent}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={errMsg(fieldState.error)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />
        </Box>

        <Controller
          name={`${base}.isCurrent`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Đang làm việc tại đây"
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    // đang làm việc: endDate = null; bỏ tích: về rỗng để nhập lại
                    setValue(`${base}.endDate`, e.target.checked ? null : "");
                  }}
                />
              }
            />
          )}
        />

        <TextField
          label="Mô tả công việc"
          multiline
          minRows={3}
          {...descProps}
          slotProps={{ htmlInput: { maxLength: 500 } }}
          helperText={`${descProps.helperText ? descProps.helperText + " · " : ""}${description.length}/500 ký tự`}
        />
      </Stack>
    </Paper>
  );
}

/* ----- Bước 2 ----- */
export function StepExperience() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ApplicationForm>();
  const tf = useTextField();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "workExperience",
  });

  const rawYears = watch("yearsOfExperience");
  const years = Number(rawYears);
  const hasYears = rawYears.trim() !== "" && Number.isInteger(years);
  const showList = hasYears && years >= 1;
  const showPortfolio = hasYears && years === 0;

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">Kinh nghiệm làm việc</Typography>

      <Controller
        name="position"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            select
            label="Vị trí ứng tuyển"
            size="small"
            fullWidth
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
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

      <TextField
        label="Số năm kinh nghiệm"
        type="number"
        slotProps={{ htmlInput: { min: 0, max: 30 } }}
        {...tf("yearsOfExperience")}
      />

      {showPortfolio && (
        <TextField
          label="Link đồ án tốt nghiệp / Github"
          placeholder="https://github.com/..."
          {...tf("portfolioUrl")}
        />
      )}

      {showList && (
        <Stack spacing={2}>
          <Typography variant="subtitle1">Lịch sử làm việc</Typography>
          {fields.map((f, i) => (
            <ExperienceItem
              key={f.id}
              index={i}
              total={fields.length}
              onRemove={() => remove(i)}
              onMove={(to) => move(i, to)}
            />
          ))}
          {errMsg(errors.workExperience) && (
            <Typography color="error" variant="body2">
              {errMsg(errors.workExperience)}
            </Typography>
          )}
          <Box>
            <Button variant="outlined" onClick={() => append(EMPTY_ITEM)}>
              + Thêm công ty
            </Button>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
