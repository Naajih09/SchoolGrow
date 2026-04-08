import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { listSchools } from "@/services/schools.service";
import { searchResultByAdmissionNumber } from "@/services/results.service";
import { useTenant } from "@/hooks/useTenant";
import { average } from "@/utils/grade";

const schema = z.object({
  admissionNumber: z.string().min(1),
  session: z.string().min(1),
  term: z.string().min(1),
});

type CheckerValues = z.infer<typeof schema>;

export default function ResultCheckerPage() {
  const { schoolId } = useTenant();
  const [result, setResult] = useState<Awaited<ReturnType<typeof searchResultByAdmissionNumber>>>(null);
  const schoolsQuery = useQuery({
    queryKey: ["public-schools"],
    queryFn: listSchools,
  });
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schoolId ?? "");

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CheckerValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      admissionNumber: "SUN-001",
      session: "2025/2026",
      term: "First",
    },
  });

  const activeSchoolId = selectedSchoolId || schoolId || schoolsQuery.data?.[0]?.id || "";

  const onSubmit = async (values: CheckerValues) => {
    if (!activeSchoolId) return;
    const slip = await searchResultByAdmissionNumber(activeSchoolId, values.admissionNumber, values.session, values.term);
    setResult(slip);
  };

  return (
    <div className="page-shell grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Check result</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>School</Label>
              <Select value={activeSchoolId} onChange={(event) => setSelectedSchoolId(event.target.value)}>
                <option value="">Select school</option>
                {schoolsQuery.data?.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Admission number</Label>
              <Input {...register("admissionNumber")} />
            </div>
            <div>
              <Label>Session</Label>
              <Input {...register("session")} />
            </div>
            <div>
              <Label>Term</Label>
              <Input {...register("term")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Find result
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Result preview</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-950">
                    {result.student.first_name} {result.student.last_name}
                  </div>
                  <div className="text-sm text-slate-500">{result.schoolName}</div>
                </div>
                <Badge className={result.resultStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                  {result.resultStatus}
                </Badge>
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
                    {result.items.map((item) => (
                      <tr key={item.subject?.id ?? item.score} className="border-t border-slate-200">
                        <td className="px-4 py-3">{item.subject?.name ?? "Unknown subject"}</td>
                        <td className="px-4 py-3">{item.score}</td>
                        <td className="px-4 py-3">{item.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge>Total {result.total}</Badge>
                <Badge>Average {average(result.items.map((item) => item.score)).toFixed(2)}</Badge>
                <Link to={`/result-checker/print/${result.resultId}?schoolId=${result.schoolId}`}>
                  <Button variant="outline">Open printable slip</Button>
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No result loaded yet. Try the demo admission number.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
