import { Controller, useFormContext } from "react-hook-form";
import { Stack, Typography } from "@mui/material";
import type { ApplicationForm } from "../../../types/Common";
import { FormTextField, errMsg } from "../FormTextField";
import { AvatarPicker } from "./AvatarPicker";
import { EmailField } from "./EmailField";

export function StepPersonal() {
  const { control, trigger } = useFormContext<ApplicationForm>();

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">
        Thông tin cá nhân
      </Typography>

      <Controller
        name="avatar"
        control={control}
        render={({ field, fieldState }) => (
          <AvatarPicker
            file={field.value}
            error={errMsg(fieldState.error)}
            buttonRef={field.ref}
            onPick={(f) => {
              field.onChange(f);
              void trigger("avatar");
            }}
          />
        )}
      />

      <FormTextField name="fullName" label="Họ và tên" autoComplete="name" />
      <EmailField />
      <FormTextField
        name="phone"
        label="Số điện thoại"
        placeholder="0912345678"
        autoComplete="tel"
      />
      <FormTextField
        name="dob"
        label="Ngày sinh"
        type="date"
        autoComplete="bday"
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Stack>
  );
}
