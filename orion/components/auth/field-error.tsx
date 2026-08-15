export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p className="mt-1.5 text-sm text-red-600" role="alert">
      {messages[0]}
    </p>
  );
}
