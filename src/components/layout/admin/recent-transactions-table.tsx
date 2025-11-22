import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type RecentTransaction = {
  date: string;
  type: string;
  resident: string;
  amount: string;
  status: "Completed" | "Pending" | "Rejected";
};

const statusStyles: Record<RecentTransaction["status"], string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

export const RecentTransactionsTable = ({
  transactions,
  title = "Recent Transactions",
  subtitle = "Latest financial movements from residents",
  ctaLabel = "View All",
  onCtaClick,
}: {
  transactions: RecentTransaction[];
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left py-2 font-medium">Date</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-left py-2 font-medium">Resident</th>
              <th className="text-left py-2 font-medium">Amount</th>
              <th className="text-left py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={`${transaction.date}-${transaction.resident}-${transaction.type}`}
                className="border-t border-border/60 hover:bg-muted/40 transition-colors"
              >
                <td className="py-3">{transaction.date}</td>
                <td className="py-3">{transaction.type}</td>
                <td className="py-3">{transaction.resident}</td>
                <td className="py-3 font-semibold text-foreground">
                  {transaction.amount}
                </td>
                <td className="py-3">
                  <Badge
                    className={`${statusStyles[transaction.status]} border-0`}
                  >
                    {transaction.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

