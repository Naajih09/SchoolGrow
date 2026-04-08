import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { deleteStudent, listStudents, upsertStudent } from "@/services/students.service";
import { listClasses } from "@/services/classes.service";
import { useTenant } from "@/hooks/useTenant";
import type { Student } from "@/types";

const schema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  admission_number: z.string().min(1),
  class_id: z.string().min(1),
  gender: z.string().min(1),
  date_of_birth: z.string().min(1),
  guardian_name: z.string().min(1),
  guardian_phone: z.string().min(1),
});

type StudentFormValues = z.infer<typeof schema>;

export default function StudentsPage() {
  const { schoolId } = useTenant();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const students = studentsQuery.data ?? [];
  const classes = classesQuery.data ?? [];

  const defaultValues = useMemo<StudentFormValues>(
    () => ({
      first_name: "",
      last_name: "",
      admission_number: "",
      class_id: classes[0]?.id ?? "",
      gender: "Female",
      date_of_birth: "",
      guardian_name: "",
      guardian_phone: "",
    }),
    [classes],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = async (values: StudentFormValues) => {
    if (!schoolId) return;
    await upsertStudent(schoolId, editingId ? { id: editingId, ...values } : values);
    setEditingId(null);
    reset(defaultValues);
    await queryClient.invalidateQueries({ queryKey: ["students", schoolId] });
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    reset({
      first_name: student.first_name,
      last_name: student.last_name,
      admission_number: student.admission_number,
      class_id: student.class_id,
      gender: student.gender,
      date_of_birth: student.date_of_birth,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
    });
  };

  const handleDelete = async (id: string) => {
    if (!schoolId) return;
    await deleteStudent(schoolId, id);
    await queryClient.invalidateQueries({ queryKey: ["students", schoolId] });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit student" : "Add student"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>First name</Label>
                <Input {...register("first_name")} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input {...register("last_name")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Admission number</Label>
                <Input {...register("admission_number")} />
              </div>
              <div>
                <Label>Class</Label>
                <Select {...register("class_id")}>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Gender</Label>
                <Select {...register("gender")}>
                  <option>Female</option>
                  <option>Male</option>
                </Select>
              </div>
              <div>
                <Label>Date of birth</Label>
                <Input type="date" {...register("date_of_birth")} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Guardian name</Label>
                <Input {...register("guardian_name")} />
              </div>
              <div>
                <Label>Guardian phone</Label>
                <Input {...register("guardian_phone")} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {editingId ? "Save changes" : "Create student"}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    reset(defaultValues);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Admission</TH>
                  <TH>Class</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {students.map((student) => (
                  <TR key={student.id}>
                    <TD>
                      {student.first_name} {student.last_name}
                    </TD>
                    <TD>{student.admission_number}</TD>
                    <TD>{classes.find((item) => item.id === student.class_id)?.name ?? student.class_id}</TD>
                    <TD>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(student)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(student.id)}>
                          Delete
                        </Button>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <div className="mt-4">
            <Badge>Total {students.length}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

