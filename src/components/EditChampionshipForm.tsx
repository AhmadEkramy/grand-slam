
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useChampionships } from '../hooks/useChampionships';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Championship } from '../types';

interface EditChampionshipFormProps {
  championship: Championship;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ChampionshipFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  registrationEnabled: boolean;
}

const EditChampionshipForm: React.FC<EditChampionshipFormProps> = ({ championship, onSuccess, onCancel }) => {
  const { updateChampionship, loading } = useChampionships();
  
  const form = useForm<ChampionshipFormData>({
    defaultValues: {
      title: championship.title,
      description: championship.description,
      date: championship.date,
      time: championship.time,
      registrationEnabled: championship.registrationEnabled,
    },
  });

  useEffect(() => {
    form.reset({
      title: championship.title,
      description: championship.description,
      date: championship.date,
      time: championship.time,
      registrationEnabled: championship.registrationEnabled,
    });
  }, [championship, form]);

  const onSubmit = async (data: ChampionshipFormData) => {
    try {
      await updateChampionship(championship.id, data);
      onSuccess();
    } catch (error) {
      console.error('Error updating championship:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-xl font-bold text-primary mb-4">Edit Championship</h3>
      
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Championship'}
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

export default EditChampionshipForm;
