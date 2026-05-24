import { useState } from 'react';
import type { ZodType } from 'zod';

type Errors<V> = Partial<Record<keyof V | '_form', string>>;

export function useZodForm<V extends Record<string, unknown>>(
  schema: ZodType<unknown, V>,
  initial: V,
) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Errors<V>>({});

  function setField<K extends keyof V>(name: K, value: V[K]) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }

  function validate(): V | null {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return values;
    }
    const next: Errors<V> = {};
    for (const issue of result.error.issues) {
      const key = (issue.path[0] as keyof V) ?? '_form';
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return null;
  }

  function setFormError(message: string) {
    setErrors((prev) => ({ ...prev, _form: message }));
  }

  return { values, errors, setField, validate, setFormError, setErrors };
}
