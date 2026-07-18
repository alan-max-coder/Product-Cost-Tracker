import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Package, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { ComputedProduct } from '@/hooks/use-products';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardViewProps {
  products: ComputedProduct[];
  onNavigateToProducts: () => void;
}

export function DashboardView({ products, onNavigateToProducts }: DashboardViewProps) {
  const stats = useMemo(() => {
    const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
    const uniqueProducts = products.length;
    const totalInvestment = products.reduce((sum, p) => sum + p.totalCost, 0);
    const totalRevenue = products.reduce((sum, p) => sum + p.totalSellingValue, 0);
    const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
    const overallMargin = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    return {
      uniqueProducts,
      totalProducts,
      totalInvestment,
      totalRevenue,
      totalProfit,
      overallMargin,
    };
  }, [products]);

  const categoryData = useMemo(() => {
    const map = new Map<string, { category: string; profit: number; revenue: number; cost: number }>();
    
    products.forEach(p => {
      const existing = map.get(p.category) || { category: p.category, profit: 0, revenue: 0, cost: 0 };
      existing.profit += p.profit;
      existing.revenue += p.totalSellingValue;
      existing.cost += p.totalCost;
      map.set(p.category, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5); // top 5 categories
  }, [products]);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-6"
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">No products yet</h2>
            <p className="text-muted-foreground">
              Your dashboard will populate once you add your first product. Start tracking your inventory and profits today.
            </p>
          </div>
          <Button size="lg" onClick={onNavigateToProducts} className="w-full sm:w-auto">
            Add Your First Product
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProducts} total units
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</div>
              <p className="text-xs text-muted-foreground">
                Capital tied up
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                If all units sold
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. Profit</CardTitle>
              <div className={cn("h-4 w-4", stats.totalProfit >= 0 ? "text-emerald-500" : "text-destructive")}>
                {stats.totalProfit >= 0 ? <ArrowUpRight /> : <ArrowDownRight />}
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", stats.totalProfit > 0 ? "text-emerald-600 dark:text-emerald-500" : stats.totalProfit < 0 ? "text-destructive" : "")}>
                {formatCurrency(stats.totalProfit)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercent(stats.overallMargin)} overall margin
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Profit by Category</CardTitle>
            <CardDescription>
              Top performing categories by estimated profit
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <div className="text-[0.70rem] uppercase text-muted-foreground font-semibold mb-2">
                              {payload[0].payload.category}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-emerald-600 dark:text-emerald-500">
                                Profit: {formatCurrency(payload[0].value as number)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Revenue: {formatCurrency(payload[0].payload.revenue)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>
              Latest products added to inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-secondary/50">
                        {product.category}
                      </Badge>
                      <span>{product.quantity} units</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={cn("text-sm font-medium", product.profit > 0 ? "text-emerald-600 dark:text-emerald-500" : product.profit < 0 ? "text-destructive" : "")}>
                      {formatCurrency(product.profit)}
                    </div>
                    <div className={cn("text-xs", product.profit > 0 ? "text-emerald-600/80 dark:text-emerald-500/80" : product.profit < 0 ? "text-destructive/80" : "text-muted-foreground")}>
                      {formatPercent(product.profitPercentage)} margin
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
