import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getResultSlipByResultId } from "@/services/results.service";
import { listSchools } from "@/services/schools.service";
import { useTenant } from "@/hooks/useTenant";

export default function ResultPrintPage() {
  const { resultId } = useParams();
  const [searchParams] = useSearchParams();
  const { schoolId } = useTenant();
  const publicSchoolsQuery = useQuery({
    queryKey: ["public-schools"],
    queryFn: listSchools,
    enabled: !schoolId,
  });
  const activeSchoolId = searchParams.get("schoolId") || schoolId || publicSchoolsQuery.data?.[0]?.id || "";
  const slipQuery = useQuery({
    queryKey: ["result-slip", activeSchoolId, resultId],
    queryFn: () => getResultSlipByResultId(activeSchoolId, resultId ?? ""),
    enabled: Boolean(activeSchoolId && resultId),
  });

  const data = slipQuery.data;

  if (!resultId) {
    return (
      <div className="page-shell">
        <Card>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Result not found.</p>
            <Link to="/result-checker">
              <Button variant="outline">Back to checker</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        <Card>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Loading printable slip...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Card>
        <CardContent className="space-y-6 p-8 print:p-0">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">{data.schoolName}</h1>
              <p className="text-sm text-slate-500">A4 printable result slip</p>
            </div>
            <Button onClick={() => window.print()}>Print</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Student</p>
              <p className="font-medium">
                {data.student.first_name} {data.student.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Admission</p>
              <p className="font-medium">{data.student.admission_number}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Class</p>
              <p className="font-medium">{data.classRecord?.name ?? data.student.class_id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Session / Term</p>
              <p className="font-medium">
                {data.session} / {data.term}
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.subject?.id ?? `${item.score}-${item.grade}`} className="border-t border-slate-200">
                    <td className="px-4 py-3">{item.subject?.name ?? "Unknown subject"}</td>
                    <td className="px-4 py-3">{item.score}</td>
                    <td className="px-4 py-3">{item.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-2">Total: {data.total}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">Average: {data.average.toFixed(2)}</span>
            <span className="rounded-full bg-slate-100 px-3 py-2">Status: {data.resultStatus}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-20 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Principal signature
            </div>
            <div className="h-20 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Class teacher signature
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
