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
import { createSchool, listSchools } from "@/services/schools.service";
import { useAuthStore } from "@/store/auth.store";

const schema = z.object({
  name: z.string().min(1),
  logo_url: z.string().url().or(z.literal("")).optional(),
  primary_color: z.string().min(1),
});

type SchoolFormValues = z.infer<typeof schema>;

export default function SchoolsPage() {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);

  const schoolsQuery = useQuery({
    queryKey: ["schools"],
    queryFn: listSchools,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SchoolFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      logo_url: "",
      primary_color: "#0f766e",
    },
  });

  const onSubmit = async (values: SchoolFormValues) => {
    await createSchool({
      name: values.name,
      logo_url: values.logo_url || null,
      primary_color: values.primary_color,
    });
    reset({
      name: "",
      logo_url: "",
      primary_color: "#0f766e",
    });
    await queryClient.invalidateQueries({ queryKey: ["schools"] });
  };

  if (session?.profile.role !== "super_admin") {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-slate-600">Only the platform owner can manage schools.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Create school</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label>Name</Label>
              <Input {...register("name")} />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input placeholder="https://..." {...register("logo_url")} />
            </div>
            <div>
              <Label>Primary color</Label>
              <Input {...register("primary_color")} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Create school
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Primary color</TH>
                  <TH>Created</TH>
                </TR>
              </THead>
              <TBody>
                {schoolsQuery.data?.map((school) => (
                  <TR key={school.id}>
                    <TD>{school.name}</TD>
                    <TD>
                      <Badge>{school.primary_color ?? "Default"}</Badge>
                    </TD>
                    <TD>{new Date(school.created_at).toLocaleDateString()}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

