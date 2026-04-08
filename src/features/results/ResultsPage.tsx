import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { approveResult, listResults, rejectResult } from "@/services/results.service";
import { useTenant } from "@/hooks/useTenant";

export default function ResultsPage() {
  const { schoolId } = useTenant();
  const queryClient = useQueryClient();

  const resultsQuery = useQuery({
    queryKey: ["results", schoolId],
    queryFn: () => listResults(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Result workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <Table>
            <THead>
              <TR>
                <TH>Student</TH>
                <TH>Score</TH>
                <TH>Term</TH>
                <TH>Session</TH>
                <TH>Status</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {resultsQuery.data?.map((result) => (
                <TR key={result.id}>
                  <TD>{result.student_id}</TD>
                  <TD>{result.score}</TD>
                  <TD>{result.term}</TD>
                  <TD>{result.session}</TD>
                  <TD>
                    <Badge className={result.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                      {result.status}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/result-checker/print/${result.id}?schoolId=${schoolId ?? ""}`}>
                        <Button size="sm" variant="outline">
                          Print
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (!schoolId) return;
                          await approveResult(schoolId, result.id);
                          await queryClient.invalidateQueries({ queryKey: ["results", schoolId] });
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!schoolId) return;
                          await rejectResult(schoolId, result.id);
                          await queryClient.invalidateQueries({ queryKey: ["results", schoolId] });
                        }}
                      >
                        Return to draft
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
