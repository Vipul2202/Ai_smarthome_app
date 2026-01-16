"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  AlertTriangle, 
  Filter, 
  Calendar, 
  Clock, 
  Plus, 
  Sparkles,
  CheckCircle2,
  Circle,
  Trash2,
  MoreVertical,
  Zap
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useReminders } from "@/hooks/use-reminders";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  APPLIANCE: "Appliance",
  EXPIRY: "Expiry",
  SHOPPING: "Shopping",
  BUDGET: "Budget",
  CUSTOM: "Custom",
  GAS_CYLINDER: "Gas Cylinder",
  WATER_CAN: "Water Can",
  FESTIVAL: "Festival",
  LOW_STOCK: "Low Stock",
  appliance: "Appliance",
  expiry: "Expiry",
  shopping: "Shopping",
  budget: "Budget",
  custom: "Custom",
};

export function RemindersTab() {
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGeneratingSmartReminders, setIsGeneratingSmartReminders] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "CUSTOM",
    scheduledAt: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    reminders: allReminders, 
    loading, 
    error, 
    addReminder, 
    completeReminder, 
    uncompleteReminder, 
    removeReminder,
    generateSmartRemindersAction,
    stats 
  } = useReminders();

  const reminders = useMemo(() => {
    if (!allReminders) return [];
    
    const sorted = [...allReminders].sort((a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
    if (filterType === "all") return sorted;
    return sorted.filter((r) => r.type.toLowerCase() === filterType.toLowerCase());
  }, [allReminders, filterType]);

  const filterOptions = [
    "all",
    "expiry",
    "shopping",
    "appliance",
    "budget",
    "custom",
  ];

  const reminderTypes = [
    { value: "CUSTOM", label: "Custom" },
    { value: "EXPIRY", label: "Expiry" },
    { value: "SHOPPING", label: "Shopping" },
    { value: "APPLIANCE", label: "Appliance" },
    { value: "BUDGET", label: "Budget" },
    { value: "GAS_CYLINDER", label: "Gas Cylinder" },
    { value: "WATER_CAN", label: "Water Can" },
    { value: "FESTIVAL", label: "Festival" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduledAt) return;

    setIsSubmitting(true);
    try {
      await addReminder({
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
      });
      
      toast.success("Reminder created successfully!");
      
      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        type: "CUSTOM",
        scheduledAt: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create reminder:", error);
      toast.error("Failed to create reminder. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSmartReminders = async () => {
    setIsGeneratingSmartReminders(true);
    try {
      const result = await generateSmartRemindersAction();
      const remindersCreated = result.data?.generateSmartReminders?.remindersCreated || 0;
      
      if (remindersCreated > 0) {
        toast.success(`Generated ${remindersCreated} smart reminder${remindersCreated > 1 ? 's' : ''}!`);
      } else {
        toast.info("No new smart reminders needed at this time.");
      }
    } catch (error) {
      console.error("Failed to generate smart reminders:", error);
      toast.error("Failed to generate smart reminders. Please try again.");
    } finally {
      setIsGeneratingSmartReminders(false);
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteReminder(id);
        toast.success("Reminder marked as pending");
      } else {
        await completeReminder(id);
        toast.success("Reminder completed!");
      }
    } catch (error) {
      toast.error("Failed to update reminder");
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await removeReminder(id);
      toast.success("Reminder deleted");
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "CUSTOM",
      scheduledAt: "",
    });
  };

  if (loading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl rounded-2xl p-6 max-w-sm mx-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-sm font-medium text-foreground mb-1">Loading reminders...</p>
            <p className="text-xs text-muted-foreground">Fetching your kitchen alerts</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl rounded-2xl p-6 max-w-sm mx-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Failed to load reminders</p>
            <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 min-h-screen"
    >
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">Kitchen Reminders</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Smart alerts for your kitchen needs</p>
            </div>
            
            {/* Desktop buttons - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSmartReminders}
                disabled={isGeneratingSmartReminders}
                className="h-9 text-xs gap-2 rounded-full px-4 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
              >
                {isGeneratingSmartReminders ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Smart Reminders</span>
                  </>
                )}
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-9 text-xs gap-2 rounded-full px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Reminder</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl w-[calc(100vw-2rem)] max-w-sm rounded-2xl fixed top-[10%] left-1/2 transform -translate-x-1/2 max-h-[80vh] overflow-y-auto mb-24">
                  <DialogHeader className="pb-3 text-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <DialogTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                        <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                      </div>
                      Create Reminder
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                      Set up a kitchen reminder for expiry dates, shopping, or custom alerts.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 px-1">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Title *
                      </label>
                      <Input
                        placeholder="e.g., Check gas cylinder..."
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                        className="h-11 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Type
                      </label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reminderTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-sm">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Date & Time *
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        required
                        className="h-11 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Description (Optional)
                      </label>
                      <Textarea
                        placeholder="Add details..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="text-sm resize-none min-h-[80px]"
                      />
                    </div>

                    <div className="flex flex-col gap-3 pt-4 pb-32 sticky bottom-0 bg-white dark:bg-slate-900 -mx-1 px-1 mb-8">
                      <Button
                        type="submit"
                        disabled={!formData.title || !formData.scheduledAt || isSubmitting}
                        className="w-full h-12 text-sm font-medium rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                      >
                        {isSubmitting ? "Creating..." : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          resetForm();
                          setIsDialogOpen(false);
                        }}
                        disabled={isSubmitting}
                        className="w-full h-12 text-sm font-medium rounded-full border-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Mobile buttons - shown only on mobile, positioned below text */}
          <div className="flex sm:hidden items-center gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSmartReminders}
              disabled={isGeneratingSmartReminders}
              className="flex-1 max-w-[140px] h-10 text-sm gap-2 rounded-full px-4 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
            >
              {isGeneratingSmartReminders ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Smart</span>
                </>
              )}
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="flex-1 max-w-[140px] h-10 text-sm gap-2 rounded-full px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl w-[calc(100vw-2rem)] max-w-sm rounded-2xl fixed top-[10%] left-1/2 transform -translate-x-1/2 max-h-[80vh] overflow-y-auto mb-24">
                <DialogHeader className="pb-3 text-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <DialogTitle className="flex items-center justify-center gap-2 text-lg font-semibold">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                      <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    Create Reminder
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                    Set up a kitchen reminder for expiry dates, shopping, or custom alerts.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 px-1">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Title *
                    </label>
                    <Input
                      placeholder="e.g., Check gas cylinder..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="h-11 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Type
                    </label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="h-11 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-sm">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      required
                      className="h-11 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Description (Optional)
                    </label>
                    <Textarea
                      placeholder="Add details..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="text-sm resize-none min-h-[80px]"
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 pb-32 sticky bottom-0 bg-white dark:bg-slate-900 -mx-1 px-1 mb-8">
                    <Button
                      type="submit"
                      disabled={!formData.title || !formData.scheduledAt || isSubmitting}
                      className="w-full h-12 text-sm font-medium rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
                    >
                      {isSubmitting ? "Creating..." : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(false);
                      }}
                      disabled={isSubmitting}
                      className="w-full h-12 text-sm font-medium rounded-full border-2"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Bell className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Done</p>
                  <p className="text-lg font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                  <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                  <p className="text-lg font-bold">{stats.upcoming}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl mb-4">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 shadow-lg">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Filter by type
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={filterType === t ? "default" : "outline"}
                className={`h-8 px-3 rounded-full text-xs font-medium transition-all ${
                  filterType === t 
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg" 
                    : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20"
                }`}
                onClick={() => setFilterType(t)}
              >
                {t === "all" ? "All" : typeLabels[t] || t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="pb-3 px-3 pt-4 sm:px-4 sm:pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">
                Active reminders
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Sorted by date, earliest first
              </p>
            </div>
            <Badge className="rounded-full text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-0 px-2 py-1 font-medium shrink-0">
              {reminders.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 px-3 pb-4 sm:px-4 sm:pb-6">
          <AnimatePresence initial={false}>
            {reminders.map((rem) => (
              <motion.div
                key={rem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800/70 transition-all duration-200 border border-gray-200/50 dark:border-slate-700/50"
              >
                <div className="mt-0.5 shrink-0">
                  <ReminderIcon type={rem.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className={`font-semibold text-sm leading-tight pr-2 transition-all ${
                      rem.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}>
                      {rem.title}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 rounded-full text-xs border-gray-300 dark:border-slate-600 text-center"
                      >
                        {typeLabels[rem.type] || rem.type}
                      </Badge>
                      {!rem.isCompleted && (
                        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-0 px-2 py-0.5 text-xs">
                          <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  {rem.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 leading-relaxed line-clamp-2">
                      {rem.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rem.scheduledAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rem.isCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleComplete(rem.id, rem.isCompleted)}
                        className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                      >
                        {rem.isCompleted ? (
                          <Circle className="w-3 h-3 text-green-600" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                        )}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-slate-700"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteReminder(rem.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {reminders.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">No reminders found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                Try selecting a different filter or create your first reminder using the button above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReminderIcon({ type }: { type: string }) {
  const base =
    "w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm";
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case "appliance":
      return (
        <div
          className={`${base} bg-gradient-to-br from-amber-500 to-orange-500`}
        >
          <AlertTriangle className="w-3 h-3" />
        </div>
      );
    case "expiry":
      return (
        <div className={`${base} bg-gradient-to-br from-red-500 to-rose-500`}>
          <Clock className="w-3 h-3" />
        </div>
      );
    case "shopping":
      return (
        <div
          className={`${base} bg-gradient-to-br from-indigo-500 to-purple-500`}
        >
          <Filter className="w-3 h-3" />
        </div>
      );
    case "budget":
      return (
        <div
          className={`${base} bg-gradient-to-br from-emerald-500 to-teal-500`}
        >
          <AlertTriangle className="w-3 h-3" />
        </div>
      );
    case "gas_cylinder":
      return (
        <div
          className={`${base} bg-gradient-to-br from-orange-500 to-red-500`}
        >
          <Zap className="w-3 h-3" />
        </div>
      );
    case "water_can":
      return (
        <div
          className={`${base} bg-gradient-to-br from-blue-500 to-cyan-500`}
        >
          <Circle className="w-3 h-3" />
        </div>
      );
    case "festival":
      return (
        <div
          className={`${base} bg-gradient-to-br from-pink-500 to-purple-500`}
        >
          <Sparkles className="w-3 h-3" />
        </div>
      );
    case "low_stock":
      return (
        <div
          className={`${base} bg-gradient-to-br from-yellow-500 to-orange-500`}
        >
          <AlertTriangle className="w-3 h-3" />
        </div>
      );
    default:
      return (
        <div
          className={`${base} bg-gradient-to-br from-slate-500 to-slate-700`}
        >
          <Bell className="w-3 h-3" />
        </div>
      );
  }
}