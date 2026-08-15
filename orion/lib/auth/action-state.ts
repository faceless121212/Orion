export type AuthActionState = {
  status: "idle" | "error" | "confirm-email";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialAuthState: AuthActionState = { status: "idle" };
