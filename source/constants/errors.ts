export const YAY_API_ERROR_CODES = {
  TOKEN_EXPIRED: -3,
  USER_BLOCKING: -12,
  USER_DELETED: -18,
  USER_BAN: -21,
  CAPTCHA_REQUIRED: -29,
  CALL_INACTIVE: -310,
  LIMITED_ACCESS: -315,
  FOLLOWER_ONLY: -317,
  USER_BANNED_CALL: -321,
  MUTUAL_ONLY: -402,
  REQUEST_LIMIT: -5301,
} as const;

export const APP_ERROR_CODES = {
  VALIDATION: {
    USER_ID_REQUIRED: 1001,
    POST_ID_REQUIRED: 1002,
    CONFERENCE_ID_REQUIRED: 1003,
    INVALID_QUERY_PARAMS: 1004,
    CALL_ID_OR_UUID_REQUIRED: 1005,
  },
  
  NOT_FOUND: {
    BOT_NOT_FOUND: 2001,
    CONFERENCE_CALL_NOT_FOUND: 2002,
    POST_NOT_FOUND: 2003,
    USER_NOT_FOUND: 2004,
  },
  
  AUTHORIZATION: {
    TOKEN_UPDATE_FAILED: 3001,
    UNAUTHORIZED: 3002,
    FORBIDDEN: 3003,
  },
  
  SERVER: {
    FETCH_AGORA_FAILED: 4001,
    INTERNAL_ERROR: 4002,
    SERVICE_UNAVAILABLE: 4003,
  },
  
  BOT: {
    NO_AVAILABLE_BOT: 5001,
    BOT_BUSY: 5002,
    BOT_INITIALIZATION_FAILED: 5003,
  },
} as const;

export const ERROR_MESSAGES = {
  [APP_ERROR_CODES.VALIDATION.USER_ID_REQUIRED]: "user_id is required.",
  [APP_ERROR_CODES.VALIDATION.POST_ID_REQUIRED]: "post_id is required.",
  [APP_ERROR_CODES.VALIDATION.CONFERENCE_ID_REQUIRED]: "conference_id is required.",
  [APP_ERROR_CODES.VALIDATION.INVALID_QUERY_PARAMS]: "Invalid query parameters.",
  [APP_ERROR_CODES.VALIDATION.CALL_ID_OR_UUID_REQUIRED]: "call_id and uuid are required.",
  
  [APP_ERROR_CODES.NOT_FOUND.BOT_NOT_FOUND]: "Bot not found.",
  [APP_ERROR_CODES.NOT_FOUND.CONFERENCE_CALL_NOT_FOUND]: "Conference call not found.",
  [APP_ERROR_CODES.NOT_FOUND.POST_NOT_FOUND]: "Post not found.",
  [APP_ERROR_CODES.NOT_FOUND.USER_NOT_FOUND]: "User not found.",
  
  [APP_ERROR_CODES.AUTHORIZATION.TOKEN_UPDATE_FAILED]: "Token update failed.",
  [APP_ERROR_CODES.AUTHORIZATION.UNAUTHORIZED]: "Unauthorized access.",
  [APP_ERROR_CODES.AUTHORIZATION.FORBIDDEN]: "Access forbidden.",
  
  [APP_ERROR_CODES.SERVER.FETCH_AGORA_FAILED]: "Failed to fetch Agora Info.",
  [APP_ERROR_CODES.SERVER.INTERNAL_ERROR]: "Internal server error.",
  [APP_ERROR_CODES.SERVER.SERVICE_UNAVAILABLE]: "Service temporarily unavailable.",
  
  [APP_ERROR_CODES.BOT.NO_AVAILABLE_BOT]: "No available bot found.",
  [APP_ERROR_CODES.BOT.BOT_BUSY]: "Bot is currently busy.",
  [APP_ERROR_CODES.BOT.BOT_INITIALIZATION_FAILED]: "Bot initialization failed.",
} as const;

export function getErrorMessage(code: number, context?: Record<string, string>): string {
  const baseMessage = ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES];
  
  if (!baseMessage) {
    return `Unknown error (code: ${code})`;
  }
  
  if (context) {
    return Object.entries(context).reduce(
      (message, [key, value]) => message.replace(`{${key}}`, value),
      baseMessage
    );
  }
  
  return baseMessage;
}

export function createError(code: number, context?: Record<string, string>) {
  return {
    code,
    message: getErrorMessage(code, context),
    timestamp: new Date().toISOString(),
  };
}

export const ERROR_CODES = YAY_API_ERROR_CODES;
