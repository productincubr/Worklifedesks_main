import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Menu, User, Mail, Pencil, Check, X, Clock, Calendar, Plus, Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Employee } from '@/app/components/auth';

type EmployeeMode = 'working' | 'away' | 'offline' | 'busy';

interface EmployeeWithStatus extends Employee {
  currentTask: string;
  taskDescription: string;
  greeting: string;
  mode: EmployeeMode;
  isPinned?: boolean;
  workHours: string;
  role?: string;
}

interface EditingState {
  [employeeId: string]: {
    field: 'greeting' | 'task' | 'workHours' | null;
  };
}

interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
  timeSpent: string; // format: "HH:MM:SS"
  inProgress: boolean;
}

interface EmployeeTasks {
  [employeeId: string]: TaskItem[];
}

interface EmployeeData {
  [employeeId: string]: {
    greeting: string;
    taskDescription: string;
    workHours: string;
  };
}

interface DashboardProps {
  employees: Employee[];
  isLoading?: boolean;
  onNavigateToGoals: () => void;
  onNavigateToTasks: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
}

const getRandomTask = (): string => {
  const tasks = ['Tyoharz listing', 'NBL', 'Worklifedesks', 'Bandana sourcing', 'Project review', 'Client call'];
  return tasks[Math.floor(Math.random() * tasks.length)];
};

const getRandomMode = (): EmployeeMode => {
  const modes: EmployeeMode[] = ['working', 'away', 'offline', 'busy'];
  return modes[Math.floor(Math.random() * modes.length)];
};

const getModeColor = (mode: EmployeeMode): string => {
  switch (mode) {
    case 'working': return 'bg-green-500';
    case 'away': return 'bg-amber-400';
    case 'offline': return 'bg-gray-400';
    case 'busy': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};



export default function Dashboard({ 
  employees,
  isLoading = false,
  onNavigateToGoals, 
  onNavigateToTasks,
  onLogout,
  onProfileClick
}: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeModes, setEmployeeModes] = useState<Record<string, EmployeeMode>>(() => {
    const saved = localStorage.getItem('employeeModes');
    return saved ? JSON.parse(saved) : {};
  });
  const [editing, setEditing] = useState<EditingState>({});
  const [employeeData, setEmployeeData] = useState<EmployeeData>(() => {
    const saved = localStorage.getItem('employeeData');
    return saved ? JSON.parse(saved) : {};
  });
  const [employeeTasks, setEmployeeTasks] = useState<EmployeeTasks>({});
  const [newTaskInput, setNewTaskInput] = useState<Record<string, string>>({});
  const [employeeNotes, setEmployeeNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('employeeNotes');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist employeeModes to localStorage
  useEffect(() => {
    localStorage.setItem('employeeModes', JSON.stringify(employeeModes));
  }, [employeeModes]);

  // Persist employeeData to localStorage
  useEffect(() => {
    localStorage.setItem('employeeData', JSON.stringify(employeeData));
  }, [employeeData]);

  // Persist employeeNotes to localStorage
  useEffect(() => {
    localStorage.setItem('employeeNotes', JSON.stringify(employeeNotes));
  }, [employeeNotes]);

  // Initialize default tasks for an employee
  const getEmployeeTasks = (empId: string): TaskItem[] => {
    if (!employeeTasks[empId]) {
      return [
        { id: '1', name: 'Bandana Vendor Follow-up', completed: false, timeSpent: '01:24:36', inProgress: false },
        { id: '2', name: 'Dye Sample Approval', completed: false, timeSpent: '00:37:12', inProgress: false },
        { id: '3', name: 'Cost Negotiation', completed: false, timeSpent: '00:19:45', inProgress: false },
        { id: '4', name: 'Inventory Check', completed: false, timeSpent: '00:12:08', inProgress: false },
        { id: '5', name: 'Front-End Bug Fixes', completed: false, timeSpent: '00:00:00', inProgress: true },
      ];
    }
    return employeeTasks[empId];
  };

  // Calculate total time from tasks
  const calculateTotalTime = (tasks: TaskItem[]): string => {
    let totalSeconds = 0;
    tasks.forEach(task => {
      if (!task.inProgress) {
        const parts = task.timeSpent.split(':');
        totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      }
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add new task
  const addTask = (employeeId: string) => {
    const taskName = newTaskInput[employeeId]?.trim();
    if (!taskName) return;
    
    const currentTasks = getEmployeeTasks(employeeId);
    const newTask: TaskItem = {
      id: Date.now().toString(),
      name: taskName,
      completed: false,
      timeSpent: '00:00:00',
      inProgress: false
    };
    
    setEmployeeTasks(prev => ({
      ...prev,
      [employeeId]: [...currentTasks, newTask]
    }));
    setNewTaskInput(prev => ({ ...prev, [employeeId]: '' }));
  };

  // Toggle task completion
  const toggleTaskCompletion = (employeeId: string, taskId: string) => {
    const currentTasks = getEmployeeTasks(employeeId);
    setEmployeeTasks(prev => ({
      ...prev,
      [employeeId]: currentTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  // Initialize employee data if not exists
  const getEmployeeData = (empId: string, task: string) => {
    if (!employeeData[empId]) {
      return {
        greeting: `I'm currently working on ${task}.`,
        taskDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
        workHours: '9:00 - 18:00'
      };
    }
    return employeeData[empId];
  };

  const getEmployeeMode = (empId: string, name: string): EmployeeMode => {
    if (employeeModes[empId]) return employeeModes[empId];
    // Deterministic fallback based on name length to avoid randomizing on re-render
    const modes: EmployeeMode[] = ['working', 'away', 'offline'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return modes[Math.abs(hash) % modes.length];
  };

  // Add status to employees
  const employeesWithStatus: EmployeeWithStatus[] = employees.map((emp, idx) => {
    const task = getRandomTask();
    const data = getEmployeeData(emp.id, task);
    return {
      ...emp,
      currentTask: task,
      taskDescription: data.taskDescription,
      greeting: data.greeting,
      mode: getEmployeeMode(emp.id, emp.name),
      isPinned: idx === 0,
      workHours: data.workHours
    };
  });

  // Filter employees based on search query
  const filteredEmployees = employeesWithStatus.filter(employee => {
    const query = searchQuery.toLowerCase();
    return (
      employee.name.toLowerCase().includes(query) ||
      (employee.role?.toLowerCase() || '').includes(query) ||
      employee.mode.toLowerCase().includes(query)
    );
  });

  const handleModeChange = (employeeId: string, mode: EmployeeMode) => {
    setEmployeeModes(prev => ({ ...prev, [employeeId]: mode }));
  };

  const startEditing = (employeeId: string, field: 'greeting' | 'task' | 'workHours') => {
    setEditing(prev => ({ ...prev, [employeeId]: { field } }));
  };

  const stopEditing = (employeeId: string) => {
    setEditing(prev => ({ ...prev, [employeeId]: { field: null } }));
  };

  const updateEmployeeData = (employeeId: string, field: 'greeting' | 'taskDescription' | 'workHours', value: string) => {
    setEmployeeData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        greeting: prev[employeeId]?.greeting || '',
        taskDescription: prev[employeeId]?.taskDescription || '',
        workHours: prev[employeeId]?.workHours || '9:00 - 18:00',
        [field]: value
      }
    }));
  };

  const isEditing = (employeeId: string, field: 'greeting' | 'task' | 'workHours') => {
    return editing[employeeId]?.field === field;
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="px-4 py-2 border-2 border-primary rounded-lg">
              <h2 className="text-sm tracking-widest text-primary font-normal">WORK LIFE DESKS</h2>
            </div>
            <button
              onClick={onProfileClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-white w-64 shadow-xl p-8 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <button onClick={() => { onNavigateToGoals(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Goals</button>
            <button onClick={() => { onNavigateToTasks(); setSidebarOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">Tasks</button>
            <hr />
            <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">Logout</button>
          </div>
          <div className="flex-1 bg-black/20" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Employees Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center mb-3 tracking-wide">EMPLOYEES</h1>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, role, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-[#1a5f4a] focus:ring-[#1a5f4a]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#1a5f4a] mx-auto mb-4" />
                  <p className="text-gray-500">Loading employees...</p>
                </div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              /* Empty State */
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {searchQuery ? 'No employees found' : 'No employees yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `No employees match "${searchQuery}". Try a different search term.`
                      : 'Add employees to get started with tracking their work and progress.'}
                  </p>
                  {searchQuery && (
                    <Button 
                      onClick={() => setSearchQuery('')}
                      variant="outline"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* Employee Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="border-2 border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex h-[400px]">
                      {/* Left side - Avatar and Name */}
                      <div className="p-6 flex flex-col items-center justify-start border-r-2 border-gray-200 bg-gray-50/50 w-[180px] shrink-0 overflow-hidden">
                        {/* Animated Avatar Placeholder */}
                        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-green-200 mb-3 overflow-hidden bg-gradient-to-br from-green-100 via-green-200 to-emerald-200 animate-pulse">
                          <svg viewBox="0 0 24 24" className="w-12 h-12 text-green-600/60 fill-current">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        
                        {/* Name */}
                        <h3 className="font-medium text-gray-800 text-lg">{employee.name || 'Employee'}</h3>
                        
                        {/* Role - under name */}
                        <p className="text-sm text-gray-500 mt-1">{employee.role || 'Team Member'}</p>
                        
                        {/* Contact Icons */}
                        <div className="mt-auto pt-6 flex justify-center gap-2">
                          <button className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                            <Mail className="w-5 h-5 text-white" />
                          </button>
                        </div>
                        
                        {/* Today's Focus - Editable */}
                        <div className="pt-4 w-full">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 text-sm">Today's Focus</p>
                            {isEditing(employee.id, 'greeting') ? (
                              <button 
                                onClick={() => stopEditing(employee.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => startEditing(employee.id, 'greeting')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <Pencil className="w-3 h-3 text-gray-400" />
                              </button>
                            )}
                          </div>
                          {isEditing(employee.id, 'greeting') ? (
                            <Input
                              value={employeeData[employee.id]?.greeting || employee.greeting}
                              onChange={(e) => updateEmployeeData(employee.id, 'greeting', e.target.value)}
                              className="h-7 text-sm mt-1"
                              placeholder="Enter today's focus..."
                            />
                          ) : (
                            <p className="text-gray-500 text-sm">{employee.greeting}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Right side - Details */}
                      <div className="flex-1 flex flex-col min-w-0">
                        {/* Top Bar - Modes */}
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-end">
                          <div className="flex items-center gap-2">
                              {/* Mode Dropdown */}
                              <Select 
                                value={employee.mode} 
                                onValueChange={(value: EmployeeMode) => handleModeChange(employee.id, value)}
                              >
                                <SelectTrigger className="w-8 h-8 border-0 bg-transparent p-0 focus:ring-0 flex-shrink-0">
                                  <div className={`w-6 h-6 rounded-full shadow-md ${getModeColor(employee.mode)}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="working">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-green-500" />
                                      <span>Working</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="away">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-amber-400" />
                                      <span>Away</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="offline">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-gray-400" />
                                      <span>Offline</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="busy">
                                    <div className="flex items-center gap-2">
                                      <div className="w-4 h-4 rounded-full bg-red-500" />
                                      <span>Busy</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                        </div>
                        
                        {/* Task Section - Task List Format */}
                        <div className="px-4 py-3 flex-1 flex flex-col bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-lg shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-800 text-sm">Task List</p>
                            {isEditing(employee.id, 'task') ? (
                              <button 
                                onClick={() => stopEditing(employee.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="w-3 h-3 text-gray-500" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => startEditing(employee.id, 'task')}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Pencil className="w-3 h-3 text-gray-400" />
                              </button>
                            )}
                          </div>
                          
                          {isEditing(employee.id, 'task') ? (
                            <div className="flex-1 flex flex-col bg-gray-50 rounded-lg p-3 -mx-1">
                              {/* Add Task Input */}
                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 focus-within:border-[#166534] focus-within:ring-1 focus-within:ring-[#166534] rounded-lg px-3 py-1.5 transition-all">
                                  {/* <Plus className="w-4 h-4 text-gray-400" /> */}
                                  <Input
                                    value={newTaskInput[employee.id] || ''}
                                    onChange={(e) => setNewTaskInput(prev => ({ ...prev, [employee.id]: e.target.value }))}
                                    placeholder="Add task..."
                                    className="border-0 h-6 text-sm p-0 focus-visible:ring-0 shadow-none bg-transparent"
                                    onKeyDown={(e) => e.key === 'Enter' && addTask(employee.id)}
                                  />
                                  <div className="relative flex items-center justify-center">
                                    <button 
                                      type="button"
                                      title="Select Date" 
                                      className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-[#166534] flex-shrink-0 cursor-pointer"
                                    >
                                      {/* <Calendar className="w-4 h-4" /> */}
                                    </button>
                                    <input 
                                      type="date" 
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      title="Select Date"
                                    />
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => addTask(employee.id)}
                                  className="h-8 px-4 text-xs bg-[#166534] hover:bg-[#14532d] text-white shadow-sm"
                                >
                                  Add
                                </Button>
                              </div>
                              
                              {/* Task List */}
                              <div className="flex-1 overflow-auto space-y-1.5 max-h-32 pr-1">
                                {getEmployeeTasks(employee.id).map((task) => (
                                  <div 
                                    key={task.id} 
                                    className={`flex items-start gap-2 py-2 px-3 rounded-md transition-colors ${task.inProgress ? 'bg-[#f0fdf4] border border-[#dcfce7]' : 'bg-white border border-gray-100 shadow-sm'}`}
                                  >
                                    <Checkbox
                                      checked={task.completed}
                                      onCheckedChange={() => toggleTaskCompletion(employee.id, task.id)}
                                      className="mt-[2px] h-3.5 w-3.5 data-[state=checked]:bg-[#166534] data-[state=checked]:border-[#166534]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-xs leading-snug break-words ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {task.name}
                                      </p>
                                      {task.inProgress && (
                                        <p className="text-[10px] text-[#166534] font-medium mt-0.5">
                                          In Progress
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 leading-relaxed">
                              {(() => {
                                const tasks = getEmployeeTasks(employee.id);
                                const inProgressTask = tasks.find(t => t.inProgress);
                                const completedCount = tasks.filter(t => t.completed).length;
                                return (
                                  <div className="space-y-1">
                                    {inProgressTask && (
                                      <p className="text-primary font-medium text-xs">
                                        Working on: {inProgressTask.name}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                      {completedCount}/{tasks.length} tasks completed
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Total: {calculateTotalTime(tasks)}
                                    </p>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Note Section */}
                        <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                          <p className="font-semibold text-gray-700 text-sm mb-1">Note</p>
                          <textarea
                            value={employeeNotes[employee.id] || ''}
                            onChange={(e) => setEmployeeNotes(prev => ({ ...prev, [employee.id]: e.target.value }))}
                            className="w-full h-[72px] min-h-[72px] text-sm border border-gray-200 rounded-md p-2 resize-none overflow-y-auto focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            placeholder="Add a note..."
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
