import { FieldError } from "@/components/auth/field-error";
import { Label } from "@/components/ui/label";

export function FormField({
  id,
  label,
  description,
  errors,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <FieldError messages={errors} />
    </div>
  );
}
