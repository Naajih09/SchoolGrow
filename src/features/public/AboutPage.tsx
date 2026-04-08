import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="page-shell">
      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-2xl font-semibold">About SchoolGrow</h2>
          <p className="text-slate-600">
            This scaffold is structured for a shared infrastructure, multi-tenant school management platform with strict
            school-level isolation in service methods and database policies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

