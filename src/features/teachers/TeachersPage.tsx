import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { deleteTeacher, listTeachers, upsertTeacher } from "@/services/teachers.service";
import { useTenant } from "@/hooks/useTenant";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  assigned_classes_text: z.string().min(1),
  assigned_subjects_text: z.string().min(1),
});

type TeacherFormValues = z.infer<typeof schema>;

export default function TeachersPage() {
  const { schoolId } = useTenant();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const teachersQuery = useQuery({
    queryKey: ["teachers", schoolId],
    queryFn: () => listTeachers(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      assigned_classes_text: "",
      assigned_subjects_text: "",
    },
  });

  const selectedClasses = watch("assigned_classes_text");
  const selectedSubjects = watch("assigned_subjects_text");

  const onSubmit = async (values: TeacherFormValues) => {
    if (!schoolId) return;
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: values.name,
      email: values.email,
      assigned_classes: values.assigned_classes_text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      assigned_subjects: values.assigned_subjects_text
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    await upsertTeacher(schoolId, payload);
    setEditingId(null);
    reset({
      name: "",
      email: "",
      assigned_classes_text: "",
      assigned_subjects_text: "",
    });
    await queryClient.invalidateQueries({ queryKey: ["teachers", schoolId] });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit teacher" : "Add teacher"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div>
              <Label>Assigned classes</Label>
              <Input placeholder="class_1, class_2" {...register("assigned_classes_text")} />
            </div>
            <div>
              <Label>Assigned subjects</Label>
              <Input placeholder="subject_1, subject_2" {...register("assigned_subjects_text")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {editingId ? "Save changes" : "Create teacher"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Classes</TH>
                  <TH>Subjects</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {teachersQuery.data?.map((teacher) => (
                  <TR key={teacher.id}>
                    <TD>{teacher.name}</TD>
                    <TD>{teacher.email}</TD>
                    <TD>{teacher.assigned_classes.join(", ")}</TD>
                    <TD>{teacher.assigned_subjects.join(", ")}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(teacher.id);
                            reset({
                              name: teacher.name,
                              email: teacher.email,
                              assigned_classes_text: teacher.assigned_classes.join(", "),
                              assigned_subjects_text: teacher.assigned_subjects.join(", "),
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={async () => {
                            if (!schoolId) return;
                            await deleteTeacher(schoolId, teacher.id);
                            await queryClient.invalidateQueries({ queryKey: ["teachers", schoolId] });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <div className="mt-4 flex gap-2">
            <Badge>Classes {selectedClasses.split(",").filter(Boolean).length}</Badge>
            <Badge>Subjects {selectedSubjects.split(",").filter(Boolean).length}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
