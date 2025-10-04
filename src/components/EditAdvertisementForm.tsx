
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAdvertisements } from '../hooks/useAdvertisements';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Advertisement } from '../types';

interface EditAdvertisementFormProps {
  advertisement: Advertisement;
  onSuccess: () => void;
  onCancel: () => void;
}

interface AdvertisementFormData {
  title: string;
  description: string;
  image: string;
  link: string;
}

const EditAdvertisementForm: React.FC<EditAdvertisementFormProps> = ({ advertisement, onSuccess, onCancel }) => {
  const { updateAdvertisement, loading } = useAdvertisements();
  
  const form = useForm<AdvertisementFormData>({
    defaultValues: {
      title: advertisement.title || '',
      description: advertisement.description || '',
      image: advertisement.image,
      link: advertisement.link || '',
    },
  });

  useEffect(() => {
    form.reset({
      title: advertisement.title || '',
      description: advertisement.description || '',
      image: advertisement.image,
      link: advertisement.link || '',
    });
  }, [advertisement, form]);

  const onSubmit = async (data: AdvertisementFormData) => {
    try {
      await updateAdvertisement(advertisement.id, data);
      onSuccess();
    } catch (error) {
      console.error('Error updating advertisement:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-xl font-bold text-primary mb-4">Edit Advertisement</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Advertisement title" {...field} />
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
                  <Textarea placeholder="Advertisement description" {...field} />
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

          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Advertisement'}
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

export default EditAdvertisementForm;
