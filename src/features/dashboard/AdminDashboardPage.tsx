import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listClasses } from "@/services/classes.service";
import { listResults } from "@/services/results.service";
import { listStudents } from "@/services/students.service";
import { listTeachers } from "@/services/teachers.service";
import { useTenant } from "@/hooks/useTenant";

export default function AdminDashboardPage() {
  const { schoolId, school } = useTenant();

  const studentsQuery = useQuery({
    queryKey: ["students", schoolId],
    queryFn: () => listStudents(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });
  const teachersQuery = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: () => listTeachers(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });
  const classesQuery = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: () => listClasses(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });
  const resultsQuery = useQuery({
    queryKey: ["results", schoolId],
    queryFn: () => listResults(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });

  const results = resultsQuery.data ?? [];
  const pending = results.filter((item) => item.status === "draft").length;
  const approved = results.filter((item) => item.status === "approved").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>School</CardDescription>
          <CardTitle>{school.schoolName ?? "Unknown school"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className="bg-teal-50 text-teal-700">{school.currentSchoolId ?? "No tenant"}</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total students</CardDescription>
          <CardTitle>{studentsQuery.data?.length ?? 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total teachers</CardDescription>
          <CardTitle>{teachersQuery.data?.length ?? 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Classes</CardDescription>
          <CardTitle>{classesQuery.data?.length ?? 0}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardDescription>Results</CardDescription>
          <CardTitle>Approval summary</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Badge className="bg-amber-50 text-amber-700">Pending {pending}</Badge>
          <Badge className="bg-emerald-50 text-emerald-700">Approved {approved}</Badge>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardDescription>Action items</CardDescription>
          <CardTitle>Next steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>1. Add students and teachers.</p>
          <p>2. Upload draft results.</p>
          <p>3. Review and approve before public viewing.</p>
        </CardContent>
      </Card>
    </div>
  );
}

