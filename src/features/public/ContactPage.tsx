import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="page-shell">
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-slate-600">Use this area for the school support, onboarding, and subscription contact details.</p>
        </CardContent>
      </Card>
    </div>
  );
}

