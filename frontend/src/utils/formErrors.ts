import { AxiosError } from 'axios';

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

type ApiErrorPayload = {
  message?: string;
  data?: {
    message?: string;
    errors?: Record<string, string>;
  };
};

export function extractFieldErrors<T extends string>(error: unknown): FieldErrors<T> {
  const response = (error as AxiosError<ApiErrorPayload>)?.response?.data;
  const errors = response?.data?.errors;

  if (!errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => Boolean(message))
  ) as FieldErrors<T>;
}

export function extractErrorMessage(error: unknown, fallback: string): string {
  const response = (error as AxiosError<ApiErrorPayload>)?.response?.data;
  return response?.message || response?.data?.message || fallback;
}
