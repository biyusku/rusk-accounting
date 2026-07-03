import { BlurFade } from "@/components/ui/blur-fade";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export default function TransactionsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">İşlemler</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tüm banka hareketleri ve işlem geçmişi
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1} inView>
        <TransactionsTable />
      </BlurFade>
    </div>
  );
}