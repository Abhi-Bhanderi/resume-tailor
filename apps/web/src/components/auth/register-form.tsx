"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerFormSchema = z
  .object({
    name: z.string().min(2, "Please enter your name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (values: RegisterValues) => {
    setFormError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage =
            typeof result.error === "object"
              ? Object.values(result.error)
                  .flat()
                  .filter(Boolean)
                  .join(" \n") || result.message || "We could not create your account."
              : result.message ?? "We could not create your account.";
          setFormError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        toast.success("Account created. Check your email to verify.");
        form.reset();
      } catch (error) {
        console.error(error);
        const message = "We could not create your account. Please try again.";
        setFormError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">Start tailoring resumes with verifiable proof in minutes.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <Input label="Full name" placeholder="Ada Lovelace" disabled={isPending} {...form.register("name")} />
        <Input label="Email" placeholder="you@example.com" disabled={isPending} {...form.register("email")} />
        <Input label="Password" type="password" disabled={isPending} {...form.register("password")} />
        <Input label="Confirm password" type="password" disabled={isPending} {...form.register("confirmPassword")} />
        {formError ? <p className="text-sm text-red-600 whitespace-pre-line">{formError}</p> : null}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <div className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </div>
    </div>
  );
}
