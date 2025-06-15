import React from 'react';
import { useForm } from 'react-hook-form';
import { useProducts } from '../hooks/useProducts';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image: string;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess, onCancel }) => {
  const { addProduct, loading } = useProducts();
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: '',
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      await addProduct(data);
      onSuccess();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-xl font-bold text-primary mb-4">Add New Product</h3>
      
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
            <Button type="submit" disabled={loading} className="flex-1 bg-[#13005A] hover:bg-[#1C82AD] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300">
              {loading ? 'Adding...' : 'Add Product'}
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

export default AddProductForm;
