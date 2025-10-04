
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProducts } from '../hooks/useProducts';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Product } from '../types';

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image: string;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const { updateProduct, loading } = useProducts();
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    },
  });

  useEffect(() => {
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    });
  }, [product, form]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct(product.id, data);
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-xl font-bold text-primary mb-4">Edit Product</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'Product name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Product description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            rules={{ 
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (EGP)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            rules={{ required: 'Image URL is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EditProductForm;
