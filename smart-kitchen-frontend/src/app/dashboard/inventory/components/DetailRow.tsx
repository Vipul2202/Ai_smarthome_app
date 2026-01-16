export function DetailRow({ label, value }: { label: string; value: string }) {
    return (
      <div className="flex justify-between text-sm py-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  }
  