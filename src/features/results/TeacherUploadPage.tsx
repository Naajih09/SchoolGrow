import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { listClasses } from "@/services/classes.service";
import { listStudents } from "@/services/students.service";
import { listSubjects } from "@/services/subjects.service";
import { upsertResult } from "@/services/results.service";
import { useTenant } from "@/hooks/useTenant";

const schema = z.object({
  student_id: z.string().min(1),
  class_id: z.string().min(1),
  subject_id: z.string().min(1),
  score: z.coerce.number().min(0).max(100),
  term: z.string().min(1),
  session: z.string().min(1),
});

type UploadValues = z.infer<typeof schema>;

export default function TeacherUploadPage() {
  const { schoolId, session } = useTenant();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ["students", schoolId],
    queryFn: () => listStudents(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });
  const classesQuery = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: () => listClasses(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });
  const subjectsQuery = useQuery({
    queryKey: ["subjects", schoolId],
    queryFn: () => listSubjects(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UploadValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_id: "",
      class_id: classesQuery.data?.[0]?.id ?? "",
      subject_id: subjectsQuery.data?.[0]?.id ?? "",
      score: 0,
      term: "First",
      session: "2025/2026",
    },
  });

  const onSubmit = async (values: UploadValues) => {
    if (!schoolId || !session) return;
    await upsertResult(schoolId, {
      ...values,
      uploaded_by: session.profile.id,
    });
    reset({
      student_id: "",
      class_id: classesQuery.data?.[0]?.id ?? "",
      subject_id: subjectsQuery.data?.[0]?.id ?? "",
      score: 0,
      term: "First",
      session: "2025/2026",
    });
    await queryClient.invalidateQueries({ queryKey: ["results", schoolId] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload result</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label>Student</Label>
            <Select {...register("student_id")}>
              <option value="">Select student</option>
              {studentsQuery.data?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Class</Label>
            <Select {...register("class_id")}>
              <option value="">Select class</option>
              {classesQuery.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Subject</Label>
            <Select {...register("subject_id")}>
              <option value="">Select subject</option>
              {subjectsQuery.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Score</Label>
            <Input type="number" {...register("score")} />
          </div>
          <div>
            <Label>Term</Label>
            <Input {...register("term")} />
          </div>
          <div>
            <Label>Session</Label>
            <Input {...register("session")} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              Upload draft result
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

