import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  date: string;
}

export interface ComputedProduct extends Product {
  totalCost: number;
  totalSellingValue: number;
  profit: number;
  profitPercentage: number;
}

const STORAGE_KEY = 'productCostTracker_products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored products', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const computedProducts = useMemo(() => {
    return products.map(product => {
      const totalCost = product.quantity * product.costPrice;
      const totalSellingValue = product.quantity * product.sellingPrice;
      const profit = totalSellingValue - totalCost;
      const profitPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;

      return {
        ...product,
        totalCost,
        totalSellingValue,
        profit,
        profitPercentage,
      };
    });
  }, [products]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    products: computedProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoaded
  };
}
