import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Textarea } from '@/app/components/ui/textarea';

import { Calendar, Clock, MoreVertical, Pencil, Target } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

export interface DailyTask {
  id: string;
  weeklyGoalId: string;
  targetId: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  tags: string[];
  priority: 'High' | 'Mid' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
  timeSpent: number; // in minutes
  isActive: boolean; // currently being worked on
  starred?: boolean;
  assignedTo?: string;
  notes?: string;
  addedToMyTasks?: boolean;
}

interface DailyTasksProps {
  tasks: DailyTask[];
  weeklyGoals: Array<{ id: string; goalTitle: string; targets: Array<{ id: string; title: string }> }>;
  onAddTask: (task: Omit<DailyTask, 'id' | 'timeSpent' | 'isActive'>) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: DailyTask['status']) => void;
  onStartStopTask: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<DailyTask>) => void;
}

export default function DailyTasks({
  tasks,
  weeklyGoals,
  onAddTask,
  onToggleTask,
  onUpdateTaskStatus: _onUpdateTaskStatus,
  onUpdateTask
}: DailyTasksProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedTask, setExpandedTask] = useState<DailyTask | null>(null);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);

  const [newTask, setNewTask] = useState({
    weeklyGoalId: '',
    targetId: '',
    title: '',
    dueDate: '',
    dueTime: '',
    assignedTo: '',
    notes: '',
    tags: '',
    priority: 'Mid' as const,
    status: 'To Do' as const
  });

  const [activeTaskTimes, setActiveTaskTimes] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTaskTimes(prev => {
        const newTimes = { ...prev };
        tasks.forEach(task => {
          if (task.isActive) {
            newTimes[task.id] = (newTimes[task.id] || task.timeSpent) + 1;
          } else {
            newTimes[task.id] = task.timeSpent;
          }
        });
        return newTimes;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tasks]);

  const handleSubmit = () => {
    if (newTask.title && newTask.weeklyGoalId && newTask.targetId && newTask.dueDate) {
      onAddTask({
        ...newTask,
        tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        starred: false,
        addedToMyTasks: false
      });
      setNewTask({
        weeklyGoalId: '',
        targetId: '',
        title: '',
        dueDate: '',
        dueTime: '',
        assignedTo: '',
        notes: '',
        tags: '',
        priority: 'Mid',
        status: 'To Do'
      });
      setIsDialogOpen(false);
    }
  };

  const selectedGoal = weeklyGoals.find(g => g.id === newTask.weeklyGoalId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-300';
      case 'Mid': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const toggleStar = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateTask) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        onUpdateTask(taskId, { starred: !task.starred });
      }
    }
  };







  return (
<>
<div className="bg-white rounded-[36px] border border-[#e5e7eb] overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between px-10 py-8 border-b border-[#ececec]">

        <h2 className="text-[34px] font-bold tracking-wide text-[#166534]">
          TASKS
        </h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

          <DialogTrigger asChild>

            <button
              className="
          h-[45px]
          px-5
          rounded-[18px]
          bg-[#166534]
          text-white
          text-[18px]
          font-semibold
          hover:bg-[#14532d]
          transition-all
        "
            >
              + Add Task
            </button>

          </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-gray-700" htmlFor="weeklyGoal">Select Weekly Goal *</Label>
                    <select
                      id="weeklyGoal"
                      value={newTask.weeklyGoalId}
                      onChange={(e) => setNewTask({ ...newTask, weeklyGoalId: e.target.value, targetId: '' })}
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Choose a weekly goal...</option>
                      {weeklyGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.goalTitle}</option>
                      ))}
                    </select>
                  </div>
                  {selectedGoal && (
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium text-gray-700" htmlFor="target">Select Target *</Label>
                      <select
                        id="target"
                        value={newTask.targetId}
                        onChange={(e) => setNewTask({ ...newTask, targetId: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Choose a target...</option>
                        {selectedGoal.targets.map(target => (
                          <option key={target.id} value={target.id}>{target.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-gray-700" htmlFor="taskTitle">Task Title *</Label>
                    <Input
                      id="taskTitle"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g., Website Development"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium text-gray-700" htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium text-gray-700" htmlFor="dueTime">Due Time</Label>
                      <Input
                        id="dueTime"
                        type="time"
                        value={newTask.dueTime}
                        onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-gray-700" htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-gray-700" htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newTask.notes}
                      onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-gray-700" htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newTask.tags}
                      onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                      placeholder="e.g., Work, Design, Urgent"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-medium text-gray-700" htmlFor="priority">Priority *</Label>
                    <select
                      id="priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Mid">Mid</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                <Button type="button" onClick={handleSubmit} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>

        </Dialog>

      </div>

      {/* TABLE HEADER */}
      <div
        className="
    grid
    grid-cols-[2.5fr_1.2fr_1.1fr_1fr_1fr_80px]
    px-10
    py-4
    bg-[#f8fafc]
    border-b
    border-[#ececec]
  "
      >

        <p className="text-sm font-semibold text-[#6b7280]">
          TASK
        </p>

        <p className="text-sm font-semibold text-[#6b7280]">
          ASSIGNED TO
        </p>

        <p className="text-sm font-semibold text-[#6b7280]">
          DUE DATE
        </p>

        <p className="text-sm font-semibold text-[#6b7280]">
          PRIORITY
        </p>

        <p className="text-sm font-semibold text-[#6b7280]">
          STATUS
        </p>

      </div>

      {/* TASK ROWS */}
      <div>

        {tasks.map((task, index) => (

          <div
            key={task.id}
            className={cn(
              `
          grid
          grid-cols-[2.5fr_1.2fr_1.1fr_1fr_1fr_80px]
          items-center
          px-10
          py-4
          hover:bg-[#fafafa]
          transition-all
        `,
              index !== tasks.length - 1 &&
              'border-b border-[#f1f5f9]'
            )}
          >

            {/* TASK */}
            <div className="flex items-center gap-3">

              <Checkbox
                checked={task.status === 'Done'}
                onCheckedChange={() => onToggleTask(task.id)}
                className="
            w-5
            h-5
            rounded border-[#cbd5e1]
            data-[state=checked]:bg-[#2563eb]
            data-[state=checked]:border-[#2563eb]
          "
              />

              <button
                onClick={(e) => toggleStar(task.id, e)}
                className="flex-shrink-0 transition-colors mr-2"
              >
                {task.starred ? (
                  <svg className="w-5 h-5 fill-yellow-400 stroke-yellow-400" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 fill-none stroke-gray-400 hover:stroke-yellow-400" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </button>

              <p
                className={cn(
                  `
              text-base
              font-medium
              text-[#0f172a]
              leading-tight
            `,
                  task.status === 'Done' &&
                  'line-through text-gray-400'
                )}
              >
                {task.title}
              </p>

            </div>

            {/* USER */}
            <div className="flex items-center gap-3">

              {task.assignedTo ? (
                <>
                  <div
                    className="
                w-8
                h-8
                rounded-full
                bg-[#166534]
                text-white
                flex
                items-center
                justify-center
                text-xs
                font-semibold
                shrink-0
              "
                  >
                    {task.assignedTo.charAt(0)}
                  </div>
                  <p className="text-sm text-[#475569]">
                    {task.assignedTo}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Unassigned</p>
              )}

            </div>

            {/* DATE */}
            <p className="text-sm text-[#64748b]">

              {new Date(task.dueDate).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}

            </p>

            {/* PRIORITY */}
            <div>

              <span
                className={cn(
                  `
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
            `,
                  task.priority === 'High' &&
                  'bg-red-100 text-red-600',

                  task.priority === 'Mid' &&
                  'bg-orange-100 text-orange-600',

                  task.priority === 'Low' &&
                  'bg-green-100 text-green-600'
                )}
              >

                {task.priority === 'Mid'
                  ? 'Medium'
                  : task.priority}

              </span>

            </div>

            {/* STATUS */}
            <div>

              <span
                className={cn(
                  `
              px-3
              py-1
              rounded-full
              text-xs
              font-semibold
            `,
                  task.status === 'Done' &&
                  'bg-green-100 text-green-700',

                  task.status === 'In Progress' &&
                  'bg-blue-100 text-blue-700',

                  task.status === 'To Do' &&
                  'bg-gray-100 text-gray-600'
                )}
              >

                {task.status === 'Done'
                  ? 'Completed'
                  : task.status}

              </span>

            </div>

            {/* MENU */}
            <button
              onClick={() => setExpandedTask(task)}
              className="
          w-8
          h-8
          rounded-md
          flex
          items-center
          justify-center
          hover:bg-[#f3f4f6]
          transition-all
        "
            >

              <MoreVertical className="w-5 h-5 text-[#9ca3af]" />

            </button>

          </div>

        ))}

      </div>
    </div>

      {/* Expanded Task View */}
  <Dialog open={!!expandedTask} onOpenChange={(open) => !open && setExpandedTask(null)}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-xl">{expandedTask?.title}</DialogTitle>
      </DialogHeader>
      {expandedTask && (
        <div className="space-y-4 mt-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getPriorityColor(expandedTask?.priority))}>
              {expandedTask?.priority} Priority
            </Badge>
            <Badge variant={expandedTask?.status === 'Done' ? 'default' : 'secondary'}>
              {expandedTask?.status}
            </Badge>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Due: {new Date(expandedTask?.dueDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Time Spent */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Time spent: {formatTime(activeTaskTimes[expandedTask?.id] || expandedTask?.timeSpent || 0)}
            </span>
          </div>

          {/* Linked Weekly Goal */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#1a5f4a]" />
              <h4 className="text-sm font-semibold text-gray-700">Linked Weekly Goal</h4>
            </div>
            <p className="text-sm text-gray-600">
              {weeklyGoals.find(g => g.id === expandedTask?.weeklyGoalId)?.goalTitle || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Target: {weeklyGoals.find(g => g.id === expandedTask?.weeklyGoalId)?.targets.find(t => t.id === expandedTask?.targetId)?.title || 'Unknown'}
            </p>
          </div>

          {/* Tags */}
          {(expandedTask?.tags?.length || 0) > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {expandedTask?.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setExpandedTask(null)}>
              Close
            </Button>
            <Button
              className="bg-[#1a5f4a] hover:bg-[#164a3a]"
              onClick={() => {
                setEditingTask(expandedTask);
                setExpandedTask(null);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Task
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>

  {/* Edit Task Dialog */ }
  <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
      </DialogHeader>
      {editingTask && (
        <div className="space-y-6 mt-4">
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-gray-700">Task Title</Label>
            <Input
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value } as DailyTask)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-gray-700">Due Date</Label>
            <Input
              type="date"
              value={editingTask.dueDate}
              onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value } as DailyTask)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-gray-700">Priority</Label>
            <select
              value={editingTask.priority}
              onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any } as DailyTask)}
              className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Low">Low</option>
              <option value="Mid">Mid</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-gray-700">Assigned To</Label>
            <Input
              value={editingTask.assignedTo || ''}
              onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value } as DailyTask)}
              placeholder="E.g. JD"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-gray-700">Tags (comma-separated)</Label>
            <Input
              value={editingTask.tags.join(', ')}
              onChange={(e) => setEditingTask({
                ...editingTask,
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
              } as DailyTask)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-medium text-gray-700">Weekly Goal</Label>
            <select
              value={editingTask.weeklyGoalId}
              onChange={(e) => setEditingTask({ ...editingTask, weeklyGoalId: e.target.value, targetId: '' } as DailyTask)}
              className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose a weekly goal...</option>
              {weeklyGoals.map(goal => (
                <option key={goal.id} value={goal.id}>{goal.goalTitle}</option>
              ))}
            </select>
          </div>
          {editingTask.weeklyGoalId && (
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-gray-700">Target</Label>
              <select
                value={editingTask.targetId}
                onChange={(e) => setEditingTask({ ...editingTask, targetId: e.target.value } as DailyTask)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Choose a target...</option>
                {weeklyGoals.find(g => g.id === editingTask.weeklyGoalId)?.targets.map(target => (
                  <option key={target.id} value={target.id}>{target.title}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#1a5f4a] hover:bg-[#164a3a]"
              onClick={() => {
                if (editingTask && onUpdateTask) {
                  onUpdateTask(editingTask.id, editingTask);
                  setEditingTask(null);
                }
              }}
              disabled={!onUpdateTask}
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
</>
  );
}