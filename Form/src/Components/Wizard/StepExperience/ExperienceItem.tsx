import { memo } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { ItemName } from "../../../types/Common";
import { FormTextField } from "../FormTextField";
import { EndDateField } from "./EndDateField";
import { CurrentCheckbox } from "./CurrentCheckbox";
import { DescriptionField } from "./DescriptionField";

export const ExperienceItem = memo(function ExperienceItem({
  index,
  isFirst,
  isLast,
  onRemove,
  onMove,
}: {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
}) {
  const base: ItemName = `workExperience.${index}`;

  return (
    <Paper
      component="section"
      aria-label={`Công ty ${index + 1}`}
      variant="outlined"
      sx={{ p: 2 }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography sx={{ fontWeight: 600 }}>Công ty {index + 1}</Typography>
          <Stack direction="row" spacing={0.5}>
            <Button
              size="small"
              disabled={isFirst}
              onClick={() => onMove(index, index - 1)}
              aria-label={`Đưa công ty ${index + 1} lên`}
            >
              ↑
            </Button>
            <Button
              size="small"
              disabled={isLast}
              onClick={() => onMove(index, index + 1)}
              aria-label={`Đưa công ty ${index + 1} xuống`}
            >
              ↓
            </Button>
            <Button size="small" color="error" onClick={() => onRemove(index)}>
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
          <FormTextField name={`${base}.companyName`} label="Tên công ty" />
          <FormTextField name={`${base}.role`} label="Vị trí" />
          <FormTextField
            name={`${base}.startDate`}
            label="Ngày bắt đầu"
            type="month"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <EndDateField base={base} />
        </Box>

        <CurrentCheckbox base={base} />
        <DescriptionField base={base} />
      </Stack>
    </Paper>
  );
});
