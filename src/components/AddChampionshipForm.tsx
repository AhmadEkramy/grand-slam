import React from 'react';
import { useForm } from 'react-hook-form';
import { useChampionships } from '../hooks/useChampionships';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';

interface AddChampionshipFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ChampionshipFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  registrationEnabled: boolean;
  image?: string;
}

const AddChampionshipForm: React.FC<AddChampionshipFormProps> = ({ onSuccess, onCancel }) => {
  const { addChampionship, loading } = useChampionships();
  
  const form = useForm<ChampionshipFormData>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      registrationEnabled: true,
    },
  });

  const onSubmit = async (data: ChampionshipFormData) => {
    try {
      await addChampionship(data);
      onSuccess();
    } catch (error) {
      console.error('Error adding championship:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-xl font-bold text-primary mb-4">Add New Championship</h3>
      
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
                  <Input placeholder="Championship title" {...field} />
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
                  <Textarea placeholder="Championship description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              rules={{ required: 'Time is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            rules={{ required: 'Location is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Championship location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <FormLabel>Registration Enabled</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
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
              {loading ? 'Adding...' : 'Add Championship'}
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

export default AddChampionshipForm;
