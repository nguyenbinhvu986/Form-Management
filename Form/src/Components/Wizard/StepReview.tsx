import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { formatVnd } from "../../types/Common";
import type { ApplicationForm } from "../../types/Common";
import { errMsg } from "../Hooks/useTextField";

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 0.5,
        gridTemplateColumns: { xs: "1fr", sm: "180px 1fr" },
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value || "—"}</Typography>
    </Box>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight={600}>{title}</Typography>
          <Button size="small" onClick={onEdit}>
            Chỉnh sửa
          </Button>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

// onEdit(stepIndex): quay về đúng bước, dữ liệu các bước khác vẫn giữ nguyên
export function StepReview({ onEdit }: { onEdit: (step: number) => void }) {
  const { control, watch } = useFormContext<ApplicationForm>();
  const v = watch();
  const years = Number(v.yearsOfExperience);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Xem lại & xác nhận</Typography>

      <Section title="Thông tin cá nhân" onEdit={() => onEdit(0)}>
        <Row label="Họ và tên" value={v.fullName} />
        <Row label="Email" value={v.email} />
        <Row label="Số điện thoại" value={v.phone} />
        <Row label="Ngày sinh" value={v.dob} />
        <Row label="Ảnh đại diện" value={v.avatar?.name} />
      </Section>

      <Section title="Kinh nghiệm làm việc" onEdit={() => onEdit(1)}>
        <Row label="Vị trí ứng tuyển" value={v.position} />
        <Row label="Số năm kinh nghiệm" value={v.yearsOfExperience} />
        {years === 0 ? (
          <Row label="Link đồ án / Github" value={v.portfolioUrl} />
        ) : (
          v.workExperience.map((w, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={0.5}>
                <Typography fontWeight={600}>
                  {w.companyName} – {w.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {w.startDate} đến {w.isCurrent ? "hiện tại" : w.endDate}
                </Typography>
                {w.description && (
                  <Typography variant="body2">{w.description}</Typography>
                )}
              </Stack>
            </Paper>
          ))
        )}
      </Section>

      <Section title="Kỹ năng & kỳ vọng" onEdit={() => onEdit(2)}>
        <Row
          label="Kỹ năng"
          value={v.skills.map((s) => `${s.name} (${s.level})`).join(", ")}
        />
        <Row
          label="Mức lương kỳ vọng"
          value={v.expectedSalary && `${formatVnd(v.expectedSalary)} VNĐ`}
        />
        <Row label="Hình thức làm việc" value={v.workMode} />
        {v.workMode === "Remote" && <Row label="Múi giờ" value={v.timezone} />}
      </Section>

      <Controller
        name="agreedToTerms"
        control={control}
        render={({ field, fieldState }) => (
          <Box>
            <FormControlLabel
              label="Tôi cam kết các thông tin cung cấp là chính xác"
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
            />
            {fieldState.error && (
              <FormHelperText error>{errMsg(fieldState.error)}</FormHelperText>
            )}
          </Box>
        )}
      />
    </Stack>
  );
}
