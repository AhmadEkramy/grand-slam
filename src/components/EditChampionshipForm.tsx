import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useChampionships } from '../hooks/useChampionships';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Championship, TeamPair } from '../types';

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
  image?: string;
}

const EditChampionshipForm: React.FC<EditChampionshipFormProps> = ({ championship, onSuccess, onCancel }) => {
  const { updateChampionship, loading } = useChampionships();
  const [teams, setTeams] = useState<TeamPair[]>(championship.teams || []);

  const form = useForm<ChampionshipFormData>({
    defaultValues: {
      title: championship.title,
      description: championship.description,
      date: championship.date,
      time: championship.time,
      registrationEnabled: championship.registrationEnabled,
      image: championship.image || '',
    },
  });

  useEffect(() => {
    form.reset({
      title: championship.title,
      description: championship.description,
      date: championship.date,
      time: championship.time,
      registrationEnabled: championship.registrationEnabled,
      image: championship.image || '',
    });
    setTeams(championship.teams || []);
  }, [championship, form]);

  const onSubmit = async (data: ChampionshipFormData) => {
    try {
      await updateChampionship(championship.id, { ...data, teams });
      onSuccess();
    } catch (error) {
      console.error('Error updating championship:', error);
    }
  };

  const handleTeamChange = (idx: number, field: keyof TeamPair, value: string) => {
    setTeams(prev => prev.map((team, i) => i === idx ? { ...team, [field]: value } : team));
  };

  const handleAddTeam = () => {
    setTeams(prev => [...prev, { teamA: '', teamB: '' }]);
  };

  const handleRemoveTeam = (idx: number) => {
    setTeams(prev => prev.filter((_, i) => i !== idx));
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

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} />
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

          <div>
            <label className="block font-medium mb-2">Teams Playing</label>
            {teams.map((team, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Team A"
                  value={team.teamA}
                  onChange={e => handleTeamChange(idx, 'teamA', e.target.value)}
                  className="form-control flex-1"
                />
                <span className="mx-1">vs</span>
                <input
                  type="text"
                  placeholder="Team B"
                  value={team.teamB}
                  onChange={e => handleTeamChange(idx, 'teamB', e.target.value)}
                  className="form-control flex-1"
                />
                <button type="button" onClick={() => handleRemoveTeam(idx)} className="text-red-500 text-lg font-bold px-2">&times;</button>
              </div>
            ))}
            <button type="button" onClick={handleAddTeam} className="btn-outline mt-2">Add a team</button>
          </div>

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
