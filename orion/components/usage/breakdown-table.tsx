import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTokens, formatUsd, type UsageBreakdownRow } from "@/lib/usage/summary";

export function BreakdownTable({
  title,
  description,
  label,
  rows,
}: {
  title: string;
  description: string;
  label: string;
  rows: UsageBreakdownRow[];
}) {
  const totalCost = rows.reduce((sum, row) => sum + row.costUsd, 0) || 1;

  return (
    <Card className="gap-0 overflow-hidden pb-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{label}</TableHead>
            <TableHead className="text-right">Missions</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <span className="font-medium">{row.label}</span>
                  <span className="mt-1.5 block h-1 w-full max-w-40 rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-blue-600"
                      style={{ width: `${Math.max((row.costUsd / totalCost) * 100, 2)}%` }}
                    />
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.missions}</TableCell>
                <TableCell className="text-right tabular-nums">{formatTokens(row.tokens)}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatUsd(row.costUsd)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="h-20 text-center text-muted-foreground" colSpan={4}>
                No usage in this period.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
