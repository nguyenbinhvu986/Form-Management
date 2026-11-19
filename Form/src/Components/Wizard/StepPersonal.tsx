import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  Avatar,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { checkEmailTaken } from "../../types/EmailCheck";
import { isEmailFormat } from "../../types/Common";
import type { ApplicationForm } from "../../types/Common";
import { errMsg, useTextField } from "../Hooks/useTextField";

/* ----- Ô chọn ảnh đại diện: preview, thay đổi, xóa ----- */
function AvatarPicker({
  file,
  error,
  onPick,
}: {
  file: File | null;
  error?: string;
  onPick: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar src={url} sx={{ width: 72, height: 72 }} />
      <Box>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => inputRef.current?.click()}
          >
            {file ? "Thay đổi ảnh" : "Chọn ảnh"}
          </Button>
          {file && (
            <Button size="small" color="error" onClick={() => onPick(null)}>
              Xóa ảnh
            </Button>
          )}
        </Stack>
        <Typography
          variant="caption"
          color={error ? "error" : "text.secondary"}
          display="block"
          sx={{ mt: 0.5 }}
        >
          {error ?? "JPG, PNG, WEBP, tối đa 2MB"}
        </Typography>
      </Box>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = ""; // cho phép chọn lại cùng một file
        }}
      />
    </Stack>
  );
}

/* ----- Bước 1 ----- */
export function StepPersonal() {
  const { control, watch, trigger } = useFormContext<ApplicationForm>();
  const tf = useTextField();
  const email = watch("email");
  const [checking, setChecking] = useState(false);

  // Async validation: debounce 500ms sau khi ngừng gõ rồi gọi API giả lập
  useEffect(() => {
    if (!isEmailFormat(email)) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      await checkEmailTaken(email);
      if (cancelled) return;
      setChecking(false);
      void trigger("email");
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [email, trigger]);

  const emailProps = tf("email");

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">Thông tin cá nhân</Typography>

      <Controller
        name="avatar"
        control={control}
        render={({ field, fieldState }) => (
          <AvatarPicker
            file={field.value}
            error={errMsg(fieldState.error)}
            onPick={(f) => {
              field.onChange(f);
              void trigger("avatar");
            }}
          />
        )}
      />

      <TextField label="Họ và tên" {...tf("fullName")} />
      <TextField
        label="Email"
        {...emailProps}
        helperText={checking ? "Đang kiểm tra email…" : emailProps.helperText}
      />
      <TextField
        label="Số điện thoại"
        placeholder="0912345678"
        {...tf("phone")}
      />
      <TextField
        label="Ngày sinh"
        type="date"
        slotProps={{ inputLabel: { shrink: true } }}
        {...tf("dob")}
      />
    </Stack>
  );
}
