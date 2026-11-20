import { useEffect, useRef, useState } from "react";
import type { Ref } from "react";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";

export function AvatarPicker({
  file,
  error,
  onPick,
  buttonRef,
}: {
  file: File | null;
  error?: string;
  onPick: (f: File | null) => void;
  buttonRef: Ref<HTMLButtonElement>;
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
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center" }}
    >
      <Avatar
        src={url}
        alt={url ? "Ảnh đại diện" : undefined}
        sx={{ width: 72, height: 72 }}
      />
      <Box>
        <Stack direction="row" spacing={1}>
          <Button
            ref={buttonRef}
            size="small"
            variant="outlined"
            aria-describedby="avatar-hint"
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
          id="avatar-hint"
          role={error ? "alert" : undefined}
          variant="caption"
          color={error ? "error" : "text.secondary"}
          sx={{ display: "block", mt: 0.5 }}
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
          e.target.value = "";
        }}
      />
    </Stack>
  );
}
