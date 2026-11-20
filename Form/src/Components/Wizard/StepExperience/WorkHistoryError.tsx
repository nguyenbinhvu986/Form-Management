import { useFormContext, useFormState } from "react-hook-form";
import { Typography } from "@mui/material";
import type { ApplicationForm } from "../../../types/Common";
import { errMsg } from "../FormTextField";

export function WorkHistoryError() {
  const { control } = useFormContext<ApplicationForm>();
  const { errors } = useFormState({ control, name: "workExperience" });
  const message = errMsg(errors.workExperience);

  return message ? (
    <Typography
      id="workExperience-error"
      role="alert"
      color="error"
      variant="body2"
    >
      {message}
    </Typography>
  ) : null;
}
