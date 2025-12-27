
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { DateRange } from "react-day-picker";

const pollFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  options: z.array(
    z.object({
      value: z.string().min(1, "Option cannot be empty."),
    })
  ).min(2, "You must provide at least two options."),
  dates: z.object({
    from: z.date({ required_error: "A start date is required."}),
    to: z.date({ required_error: "An end date is required."}),
  }),
});

export function CreatePollForm() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof pollFormSchema>>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: "",
      description: "",
      options: [{ value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const onSubmit = async (values: z.infer<typeof pollFormSchema>) => {
    if (!firestore || !user) return;

    setIsSubmitting(true);

    const pollData = {
      title: values.title,
      description: values.description,
      options: values.options.map(option => ({ label: option.value, votes: 0 })),
      startDate: values.dates.from,
      endDate: values.dates.to,
      status: "Active" as const,
      createdAt: serverTimestamp(),
      createdBy: user.uid
    };

    try {
      const pollsCollection = collection(firestore, "polls");
      await addDoc(pollsCollection, pollData)
        .catch(error => {
            const permissionError = new FirestorePermissionError({
                path: pollsCollection.path,
                operation: 'create',
                requestResourceData: pollData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
        });

      toast({
        title: "Poll Created!",
        description: "Your new poll is now live for voting.",
      });
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Poll",
        description: "You do not have permission to create a poll.",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Poll Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., New Park Design" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe the purpose of this poll..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div>
                <Label>Voting Options</Label>
                <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name={`options.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder={`Option ${index + 1}`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                 <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                </Button>
                 {form.formState.errors.options && (
                    <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.options.message}</p>
                 )}
            </div>

            <FormField
                control={form.control}
                name="dates"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Voting Period</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value?.from && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value?.from ? (
                                        field.value.to ? (
                                        <>
                                            {format(field.value.from, "LLL dd, y")} -{" "}
                                            {format(field.value.to, "LLL dd, y")}
                                        </>
                                        ) : (
                                        format(field.value.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={field.value?.from}
                                    selected={{from: field.value?.from, to: field.value?.to}}
                                    onSelect={(range) => field.onChange(range as DateRange)}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Poll..." : "Create Poll"}
            </Button>
        </form>
    </Form>
  );
}

