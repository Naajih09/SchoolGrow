import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { deleteSubject, listSubjects, upsertSubject } from "@/services/subjects.service";
import { useTenant } from "@/hooks/useTenant";

const schema = z.object({
  name: z.string().min(1),
});

type SubjectFormValues = z.infer<typeof schema>;

export default function SubjectsPage() {
  const { schoolId } = useTenant();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

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
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: SubjectFormValues) => {
    if (!schoolId) return;
    await upsertSubject(schoolId, editingId ? { id: editingId, ...values } : values);
    setEditingId(null);
    reset({ name: "" });
    await queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit subject" : "Add subject"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {editingId ? "Save changes" : "Create subject"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Actions</TH>
              </TR>
            </THead>
            <TBody>
              {subjectsQuery.data?.map((item) => (
                <TR key={item.id}>
                  <TD>{item.name}</TD>
                  <TD>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          if (!schoolId) return;
                          await deleteSubject(schoolId, item.id);
                          await queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] });
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
        </CardContent>
      </Card>
    </div>
  );
}

