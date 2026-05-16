import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";

type FieldOption = {
  label: string;
  value: string;
};

export type ActionField = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "time" | "textarea" | "select" | "checkbox" | "file";
  placeholder?: string;
  options?: FieldOption[];
  rows?: number;
  accept?: string;
  multiple?: boolean;
};

export type ActionDialogValues = Record<string, string | boolean | File[] | null>;

type ActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  fields: ActionField[];
  initialValues: ActionDialogValues;
  onSubmit: (values: ActionDialogValues) => void | boolean;
};

export function ActionDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  fields,
  initialValues,
  onSubmit,
}: ActionDialogProps) {
  const [values, setValues] = useState<ActionDialogValues>(initialValues);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
    }
  }, [open, initialValues]);

  const updateValue = (name: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const shouldClose = onSubmit(values);
    if (shouldClose !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const value = values[field.name];

              if (field.type === "textarea") {
                return (
                  <label key={field.name} className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
                    <span>{field.label}</span>
                    <Textarea
                      rows={field.rows ?? 4}
                      placeholder={field.placeholder}
                      value={typeof value === "string" ? value : ""}
                      onChange={(event) => updateValue(field.name, event.target.value)}
                    />
                  </label>
                );
              }

              if (field.type === "select") {
                return (
                  <label key={field.name} className="space-y-2 text-sm font-medium text-gray-700">
                    <span>{field.label}</span>
                    <Select
                      value={typeof value === "string" ? value : ""}
                      onValueChange={(nextValue) => updateValue(field.name, nextValue)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                );
              }

              if (field.type === "checkbox") {
                return (
                  <label key={field.name} className="flex items-center gap-3 text-sm font-medium text-gray-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => updateValue(field.name, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }

              if (field.type === "file") {
                const files = Array.isArray(value) ? value : [];

                return (
                  <label key={field.name} className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
                    <span>{field.label}</span>
                    <Input
                      type="file"
                      accept={field.accept}
                      multiple={field.multiple}
                      onChange={(event) => updateValue(field.name, Array.from(event.target.files ?? []))}
                    />
                    {files.length > 0 ? (
                      <p className="text-xs text-gray-500">{files.length} file(s) selected</p>
                    ) : null}
                  </label>
                );
              }

              return (
                <label key={field.name} className="space-y-2 text-sm font-medium text-gray-700">
                  <span>{field.label}</span>
                  <Input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={typeof value === "string" ? value : ""}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                  />
                </label>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {submitLabel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}