import type { RegistrationInput } from "@/lib/auth/validation";

type SignUpGateway = {
  signUp(payload: unknown): Promise<{
    data: { session: unknown | null };
    error: { message: string } | null;
  }>;
};

export async function registerWithPassword(
  auth: SignUpGateway,
  input: RegistrationInput,
  emailRedirectTo: string,
) {
  const { data, error } = await auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
      emailRedirectTo,
    },
  });

  if (error) {
    return { status: "error" as const, message: "Unable to create this account." };
  }

  return {
    status: data.session ? ("signed-in" as const) : ("confirm-email" as const),
  };
}
