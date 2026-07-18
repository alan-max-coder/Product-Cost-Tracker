import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { Product } from '@/hooks/use-products';

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  costPrice: z.coerce.number().min(0, 'Cost price cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
  supplier: z.string().optional(),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food',
  'Home',
  'Beauty',
  'Sports',
  'Other',
];

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  defaultValues?: Partial<Product> | null;
  mode: 'add' | 'edit';
}

export function ProductFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  mode,
}: ProductFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      quantity: 1,
      costPrice: 0,
      sellingPrice: 0,
      supplier: '',
      date: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      if (defaultValues && mode === 'edit') {
        form.reset({
          ...defaultValues,
          date: defaultValues.date ? new Date(defaultValues.date) : new Date(),
          supplier: defaultValues.supplier || '',
        });
      } else {
        form.reset({
          name: '',
          category: '',
          quantity: 1,
          costPrice: 0,
          sellingPrice: 0,
          supplier: '',
          date: new Date(),
        });
      }
    }
  }, [open, defaultValues, mode, form]);

  const watchedValues = form.watch();

  const preview = useMemo(() => {
    const qty = Number(watchedValues.quantity) || 0;
    const cost = Number(watchedValues.costPrice) || 0;
    const sell = Number(watchedValues.sellingPrice) || 0;

    const totalCost = qty * cost;
    const totalSellingValue = qty * sell;
    const profit = totalSellingValue - totalCost;
    const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return { totalCost, totalSellingValue, profit, profitPercentage };
  }, [watchedValues.quantity, watchedValues.costPrice, watchedValues.sellingPrice]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      category: values.category,
      quantity: values.quantity,
      costPrice: values.costPrice,
      sellingPrice: values.sellingPrice,
      supplier: values.supplier || '',
      date: values.date.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</SheetTitle>
          <SheetDescription>
            {mode === 'add' ? 'Enter the details of your new product.' : 'Update the details of your product.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Wireless Mouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. TechCorp Wholesale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 space-y-3">
              <h4 className="text-sm font-semibold mb-2">Live Preview</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium">{formatCurrency(preview.totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Selling Value:</span>
                <span className="font-medium">{formatCurrency(preview.totalSellingValue)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">Estimated Profit:</span>
                <div className="text-right">
                  <div className={cn("font-bold", preview.profit > 0 ? "text-emerald-600 dark:text-emerald-500" : preview.profit < 0 ? "text-destructive" : "")}>
                    {formatCurrency(preview.profit)}
                  </div>
                  <div className={cn("text-xs", preview.profit > 0 ? "text-emerald-600/80 dark:text-emerald-500/80" : preview.profit < 0 ? "text-destructive/80" : "text-muted-foreground")}>
                    {formatPercent(preview.profitPercentage)} margin
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === 'add' ? 'Save Product' : 'Update Product'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
