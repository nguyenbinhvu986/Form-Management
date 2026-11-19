/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { ensureEmailChecked } from "./types/EmailCheck";
import {
  experienceSchema,
  personalSchema,
  reviewSchema,
  skillsSchema,
} from "./types/Schemas";
import {
  FIELD_STEP,
  STEP_LABELS,
  ServerValidationError,
  buildPayload,
  defaultValues,
  submitApplication,
} from "./types/AppForm";
import type { ApplicationPayload } from "./types/AppForm";
import type { ApplicationForm } from "./types/Common";
import { StepPersonal } from "./Components/Wizard/StepPersonal";
import { StepExperience } from "./Components/Wizard/StepExperience";
import { StepSkills } from "./Components/Wizard/StepSkills";
import { StepReview } from "./Components/Wizard/StepReview";

// Mỗi bước có schema riêng: "Tiếp tục" chỉ kiểm tra đúng bước đang đứng
const STEP_SCHEMAS = [
  personalSchema,
  experienceSchema,
  skillsSchema,
  reviewSchema,
];
const LAST = STEP_SCHEMAS.length - 1;
const DRAFT_KEY = "job-application-draft";

function readDraft(): { values: ApplicationForm; step: number } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return { values: defaultValues, step: 0 };
    const { values, step } = JSON.parse(raw);
    return {
      values: { ...defaultValues, ...values, avatar: null },
      step: Math.min(Number(step) || 0, LAST),
    };
  } catch {
    return { values: defaultValues, step: 0 };
  }
}

export default function App() {
  const [initial] = useState(readDraft);
  const [step, setStep] = useState(initial.step);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplicationPayload | null>(null);

  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const resolver: Resolver<ApplicationForm> = (values, context, options) =>
    zodResolver(STEP_SCHEMAS[stepRef.current] as any)(
      values as any,
      context,
      options as any,
    ) as any;

  const methods = useForm<ApplicationForm>({
    defaultValues: initial.values,
    mode: "onTouched",
    resolver,
  });
  const { watch, getValues, trigger, setError, reset } = methods;
  const agreed = watch("agreedToTerms");

  /* ----- Lưu nháp vào localStorage (không lưu file ảnh) ----- */
  const saveDraft = useCallback(
    (s: number) => {
      const { avatar: _avatar, ...values } = getValues();
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step: s }));
    },
    [getValues],
  );
  useEffect(() => {
    if (result) return;
    const sub = watch(() => saveDraft(stepRef.current));
    return () => sub.unsubscribe();
  }, [watch, saveDraft, result]);
  useEffect(() => {
    if (!result) saveDraft(step);
  }, [step, saveDraft, result]);

  // Khi bị đẩy về bước có lỗi lúc submit, kiểm tra lại để hiện lỗi
  const revalidate = useRef(false);
  useEffect(() => {
    if (revalidate.current) {
      revalidate.current = false;
      void trigger();
    }
  }, [step, trigger]);

  /* ----- Điều hướng ----- */
  const handleNext = async () => {
    if (step === 0) await ensureEmailChecked(getValues("email"));
    if (await trigger()) setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  /* ----- Submit ----- */
  const handleSubmit = async () => {
    if (!(await trigger())) return;
    const all = getValues();
    for (let i = 0; i < LAST; i++) {
      if (!STEP_SCHEMAS[i].safeParse(all).success) {
        revalidate.current = true;
        setStep(i);
        return;
      }
    }

    setSubmitting(true);
    setServerError(null);
    try {
      const payload = buildPayload(all);
      await submitApplication(payload);
      console.log(JSON.stringify(payload, null, 2));
      localStorage.removeItem(DRAFT_KEY);
      setResult(payload);
    } catch (e) {
      if (e instanceof ServerValidationError) {
        // map lỗi server vào đúng ô input rồi đưa người dùng về bước đó
        Object.entries(e.fieldErrors).forEach(([name, message]) =>
          setError(name as keyof ApplicationForm, { type: "server", message }),
        );
        const first = Object.keys(e.fieldErrors)[0];
        setStep(FIELD_STEP[first] ?? 0);
      } else {
        setServerError("Máy chủ gặp lỗi (500). Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ----- Màn hình thành công ----- */
  if (result) {
    return (
      <Paper sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
        <Stack spacing={2}>
          <Alert severity="success">
            Nộp hồ sơ thành công. Dữ liệu nháp đã được xóa.
          </Alert>
          <Typography variant="subtitle2">Payload JSON</Typography>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              bgcolor: "action.hover",
              borderRadius: 1,
              overflow: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                reset(defaultValues);
                setResult(null);
                setStep(0);
              }}
            >
              Nộp hồ sơ khác
            </Button>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <FormProvider {...methods}>
      <Paper
        component="form"
        noValidate
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          void (step === LAST ? handleSubmit() : handleNext());
        }}
        sx={{ p: { xs: 2, sm: 3 }, maxWidth: 760, mx: "auto" }}
      >
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Hồ sơ ứng tuyển lập trình viên
        </Typography>

        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {STEP_LABELS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Dữ liệu nằm chung trong một form nên chuyển bước không bị mất */}
        <Box sx={{ minHeight: 280 }}>
          {step === 0 && <StepPersonal />}
          {step === 1 && <StepExperience />}
          {step === 2 && <StepSkills />}
          {step === 3 && <StepReview onEdit={setStep} />}
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {serverError}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button
            type="button"
            disabled={step === 0 || submitting}
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || (step === LAST && !agreed)}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {step === LAST
              ? submitting
                ? "Đang gửi…"
                : "Gửi hồ sơ"
              : "Tiếp tục"}
          </Button>
        </Stack>
      </Paper>
    </FormProvider>
  );
}
