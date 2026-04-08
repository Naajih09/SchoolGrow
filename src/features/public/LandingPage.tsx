import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="page-shell">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-6">
          <Badge className="bg-teal-50 text-teal-700">Multi-tenant school SaaS</Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
              Manage schools, isolate data, and publish results from one shared platform.
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              SchoolGrow is scaffolded for school-level row isolation, role-based access, result approvals, and public result checking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login">
              <Button size="lg">Open Dashboard</Button>
            </Link>
            <Link to="/result-checker">
              <Button size="lg" variant="outline">
                Check a Result
              </Button>
            </Link>
          </div>
        </div>
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-4">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Platform Focus</div>
            <div className="space-y-3 text-sm leading-6 text-slate-200">
              <p>Tenant scoped student, teacher, class, subject, and result records.</p>
              <p>Supabase-ready services with local demo fallback for faster product iteration.</p>
              <p>Printable A4 result slips, approval workflow, and dashboard metrics.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

