import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { defaultValues } from "../../types/AppForm";
import type { ApplicationForm } from "../../types/Common";

const DRAFT_KEY = "job-application-draft";
const DEBOUNCE_MS = 400;

export type Draft = { values: ApplicationForm; step: number };

const draftKeys = (
  Object.keys(defaultValues) as (keyof ApplicationForm)[]
).filter((key) => key !== "avatar");

const isEmpty = (values: ApplicationForm) =>
  draftKeys.every(
    (key) => JSON.stringify(values[key]) === JSON.stringify(defaultValues[key]),
  );

export const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

export function readDraft(maxStep: number): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const { values, step } = JSON.parse(raw);
    return {
      values: { ...defaultValues, ...values, avatar: null },
      step: Math.min(Number(step) || 0, maxStep),
    };
  } catch {
    return null;
  }
}

function writeDraft(all: ApplicationForm, step: number) {
  if (isEmpty(all)) return clearDraft();
  const values = Object.fromEntries(draftKeys.map((key) => [key, all[key]]));
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step }));
}

export function useAutoSave(
  { watch, getValues }: UseFormReturn<ApplicationForm>,
  step: number,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      clearTimeout(timer);
      writeDraft(getValues(), step);
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(flush, DEBOUNCE_MS);
    };
    schedule();
    const subscription = watch(schedule);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
      window.removeEventListener("pagehide", flush);
    };
  }, [watch, getValues, step, enabled]);
}
