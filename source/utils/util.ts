import { ErrorResponse } from "./types";

export function isErrorResponse(response: any): response is ErrorResponse {
    return response?.result === "error" && typeof response.error_code === "number";
}
  