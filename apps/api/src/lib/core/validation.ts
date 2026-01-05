/**
 * シンプルなバリデーションユーティリティ
 */

import { z } from "zod";
import { Result, Ok, Err, ValidationError } from "./result";

export function validate<T>(schema: z.ZodType<T>, data: unknown): Result<T, ValidationError> {
  const result = schema.safeParse(data);
  if (result.success) {
    return Ok(result.data);
  }
  const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return Err(new ValidationError(errors));
}

export function parseJson<T>(
  schema: z.ZodType<T>,
  json: string | null
): Result<T, ValidationError> {
  if (!json) {
    return Err(new ValidationError("Data not found"));
  }
  try {
    const parsed = JSON.parse(json);
    return validate(schema, parsed);
  } catch {
    return Err(new ValidationError("Invalid JSON"));
  }
}
