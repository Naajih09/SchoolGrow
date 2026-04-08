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
import { deleteClass, listClasses, upsertClass } from "@/services/classes.service";
import { useTenant } from "@/hooks/useTenant";

const schema = z.object({
  name: z.string().min(1),
});

type ClassFormValues = z.infer<typeof schema>;

export default function ClassesPage() {
  const { schoolId } = useTenant();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const classesQuery = useQuery({
    queryKey: ["classes", schoolId],
    queryFn: () => listClasses(schoolId ?? ""),
    enabled: Boolean(schoolId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: ClassFormValues) => {
    if (!schoolId) return;
    await upsertClass(schoolId, editingId ? { id: editingId, ...values } : values);
    setEditingId(null);
    reset({ name: "" });
    await queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit class" : "Add class"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {editingId ? "Save changes" : "Create class"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
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
              {classesQuery.data?.map((item) => (
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
                          await deleteClass(schoolId, item.id);
                          await queryClient.invalidateQueries({ queryKey: ["classes", schoolId] });
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

