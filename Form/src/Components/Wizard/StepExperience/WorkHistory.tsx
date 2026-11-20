import { useFieldArray, useFormContext } from "react-hook-form";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ApplicationForm } from "../../../types/Common";
import { ExperienceItem } from "./ExperienceItem";
import { WorkHistoryError } from "./WorkHistoryError";

const EMPTY_ITEM: ApplicationForm["workExperience"][number] = {
  companyName: "",
  role: "",
  startDate: "",
  isCurrent: false,
  endDate: "",
  description: "",
};

export function WorkHistory() {
  const { control } = useFormContext<ApplicationForm>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "workExperience",
  });

  return (
    <Stack
      spacing={2}
      role="group"
      aria-labelledby="work-history-title"
      aria-describedby="workExperience-error"
    >
      <Typography id="work-history-title" variant="subtitle1">
        Lịch sử làm việc
      </Typography>
      {fields.map((f, i) => (
        <ExperienceItem
          key={f.id}
          index={i}
          isFirst={i === 0}
          isLast={i === fields.length - 1}
          onRemove={remove}
          onMove={move}
        />
      ))}
      <WorkHistoryError />
      <Box>
        <Button variant="outlined" onClick={() => append(EMPTY_ITEM)}>
          + Thêm công ty
        </Button>
      </Box>
    </Stack>
  );
}
