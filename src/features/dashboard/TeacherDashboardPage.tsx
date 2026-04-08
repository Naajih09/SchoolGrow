import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listClasses } from "@/services/classes.service";
import { listTeachers } from "@/services/teachers.service";
import { useTenant } from "@/hooks/useTenant";

export default function TeacherDashboardPage() {
  const { schoolId } = useTenant();

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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Assigned classes</CardDescription>
          <CardTitle>{classesQuery.data?.length ?? 0}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>{classesQuery.data?.map((item) => item.name).join(", ") || "No classes yet"}</Badge>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Teachers</CardDescription>
          <CardTitle>{teachersQuery.data?.length ?? 0}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">Open upload to add draft results for your assigned classes.</p>
        </CardContent>
      </Card>
    </div>
  );
}

