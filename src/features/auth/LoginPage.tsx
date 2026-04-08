import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { signIn } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolStore } from "@/store/school.store";
import type { Role } from "@/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["super_admin", "school_admin", "teacher"]),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);
  const setSchool = useSchoolStore((state) => state.setSchool);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "admin@sunrise.edu",
      password: "password",
      role: "school_admin",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      const session = await signIn(values.email, values.password, values.role as Role);
      setSession(session);
      setSchool({
        currentSchoolId: session.school.id,
        schoolName: session.school.name,
        primaryColor: session.school.primary_color,
      });
      navigate((location.state as { from?: string } | null)?.from ?? (values.role === "teacher" ? "/teacher" : "/dashboard"));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login failed.");
    }
  };

  return (
    <div className="page-shell grid min-h-[75vh] place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge className="mb-3 w-fit bg-teal-50 text-teal-700">Tenant scoped login</Badge>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use a school account to load the matching school context.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p> : null}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" {...register("role")}>
                <option value="super_admin">Super Admin</option>
                <option value="school_admin">School Admin</option>
                <option value="teacher">Teacher</option>
              </Select>
            </div>
            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
