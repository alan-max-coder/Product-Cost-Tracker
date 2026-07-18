import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, LayoutDashboard, Moon, Sun, Calculator, Plus, Github } from 'lucide-react';
import { toast } from 'sonner';

import { useTheme } from '@/hooks/use-theme';
import { useProducts, ComputedProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { DashboardView } from '@/components/dashboard-view';
import { ProductsView } from '@/components/products-view';
import { ProductFormDialog } from '@/components/product-form-dialog';
import { Toaster } from '@/components/ui/sonner';

type View = 'dashboard' | 'products';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { products, addProduct, updateProduct, deleteProduct, isLoaded } = useProducts();
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ComputedProduct | null>(null);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: ComputedProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<ComputedProduct, 'id' | 'totalCost' | 'totalSellingValue' | 'profit' | 'profitPercentage'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast.success('Product updated successfully');
    } else {
      addProduct(data);
      toast.success('Product added successfully');
      // If we're adding a product from dashboard empty state, switch to products view
      if (products.length === 0 && currentView === 'dashboard') {
        setCurrentView('products');
      }
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.success('Product deleted');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block tracking-tight">Product Cost Tracker</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
              <Button
                variant={currentView === 'dashboard' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('dashboard')}
                className="h-8 px-3 rounded-md"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </Button>
              <Button
                variant={currentView === 'products' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('products')}
                className="h-8 px-3 rounded-md"
              >
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Inventory</span>
              </Button>
            </nav>

            <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden sm:inline-flex">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            <Button size="sm" onClick={handleOpenAddForm} className="ml-2 h-9">
              <Plus className="w-4 h-4 mr-2" />
              Add <span className="hidden sm:inline ml-1">Product</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentView === 'dashboard' ? (
              <DashboardView
                products={products}
                onNavigateToProducts={() => handleOpenAddForm()}
              />
            ) : (
              <ProductsView
                products={products}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteProduct}
                onAdd={handleOpenAddForm}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-md mt-auto">
        <div className="container mx-auto px-4 h-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Built by</span>
          <a
            href="https://github.com/alan-max-coder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
          >
            <Github className="w-4 h-4" />
            alan-max-coder
          </a>
        </div>
      </footer>

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        defaultValues={editingProduct}
        mode={editingProduct ? 'edit' : 'add'}
      />
      
      <Toaster position="bottom-right" />
    </div>
  );
}
