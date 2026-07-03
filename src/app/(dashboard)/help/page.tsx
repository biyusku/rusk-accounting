import { BlurFade } from "@/components/ui/blur-fade";
import { HelpCircle } from "lucide-react";

export default function HelpPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <BlurFade delay={0} inView>
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Yardım</h1>
            <p className="text-muted-foreground text-sm mt-1">Destek ve sık sorulan sorular</p>
          </div>
        </div>
      </BlurFade>
      <BlurFade delay={0.1} inView>
        <p className="text-muted-foreground">Yardım içeriği yakında eklenecek.</p>
      </BlurFade>
    </div>
  );
}