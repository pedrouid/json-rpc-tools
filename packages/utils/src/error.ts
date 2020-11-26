import { ErrorResponse } from "./types";
import {
  INTERNAL_ERROR,
  SERVER_ERROR_CODE_RANGE,
  RESERVED_ERROR_CODES,
  STANDARD_ERROR_MAP,
} from "./constants";

export function isServerErrorCode(code: number): boolean {
  return (
    code <= SERVER_ERROR_CODE_RANGE[0] && code >= SERVER_ERROR_CODE_RANGE[1]
  );
}

export function isReservedErrorCode(code: number): boolean {
  return RESERVED_ERROR_CODES.includes(code);
}

export function isValidErrorCode(code: number): boolean {
  return isServerErrorCode(code) || isReservedErrorCode(code);
}

export function getError(type: string): ErrorResponse {
  if (!Object.keys(STANDARD_ERROR_MAP).includes(type)) {
    return STANDARD_ERROR_MAP[INTERNAL_ERROR];
  }
  return STANDARD_ERROR_MAP[type];
}

export function getErrorByCode(code: number): ErrorResponse {
  const match = Object.values(STANDARD_ERROR_MAP).find(e => e.code === code);
  if (!match) {
    return STANDARD_ERROR_MAP[INTERNAL_ERROR];
  }
  return match;
}
