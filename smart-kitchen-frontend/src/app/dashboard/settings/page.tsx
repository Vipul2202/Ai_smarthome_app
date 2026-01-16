"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Database,
  HelpCircle,
  LogOut,
  ChevronRight,
  Home,
  Users,
  ChefHat,
  Plus,
  Edit,
  Trash2,
  Crown,
  UserPlus,
  Moon,
  Sun,
  Monitor,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { clearAuthState, getCurrentUser } from "@/lib/auth"
import { useSettings, useUserProfile } from "@/hooks/use-settings"
import { useHouseholds } from "@/hooks/use-households"
import { useHapticFeedback } from "@/lib/haptics"

interface User {
  id: string
  name?: string
  email: string
  avatar?: string
  phone?: string
  location?: string
  joinedAt?: string
}

interface Household {
  id: string
  name: string
  description?: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  memberCount: number
  kitchens: Kitchen[]
  createdAt: string
  inviteCode?: string
}

interface Kitchen {
  id: string
  name: string
  type: 'HOME' | 'OFFICE' | 'PG' | 'HOSTEL'
  description?: string
  isActive: boolean
}

interface NotificationSettings {
  lowStock: boolean
  expiry: boolean
  shopping: boolean
  mealPlan: boolean
  push: boolean
  email: boolean
  sms: boolean
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  currency: string
  timezone: string
  dateFormat: string
}

type SettingsView = 'main' | 'profile' | 'notifications' | 'appearance' | 'privacy' | 'households' | 'support'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [mounted, setMounted] = useState(false)
  const [currentView, setCurrentView] = useState<SettingsView>('main')
  
  // Use real API hooks
  const { user, loading: userLoading } = useUserProfile()
  const { 
    settings, 
    preferences, 
    loading: settingsLoading,
    updateProfile,
    updateNotifications,
    updatePreferences,
    profileLoading,
    settingsUpdating,
    preferencesUpdating
  } = useSettings()
  
  const {
    households,
    loading: householdsLoading,
    createHousehold,
    updateHousehold,
    deleteHousehold,
    inviteMember,
    createKitchen,
    updateKitchen,
    deleteKitchen,
    creating,
    updating,
    deleting,
    inviting,
    creatingKitchen,
    updatingKitchen,
    deletingKitchen
  } = useHouseholds()
  
  // Form states
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState<{
    name: string;
    email: string;
    phone: string;
    location: string;
  }>({
    name: '',
    email: '',
    phone: '',
    location: '',
  })

  // Local state for settings
  const [localNotifications, setLocalNotifications] = useState<NotificationSettings>({
    lowStock: true,
    expiry: true,
    shopping: false,
    mealPlan: true,
    push: true,
    email: false,
    sms: false,
  })

  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en-US',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
      })
    }
  }, [user])

  // Update local state when settings load
  useEffect(() => {
    if (settings?.notifications) {
      setLocalNotifications(settings.notifications)
    }
  }, [settings])

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        theme: preferences.theme.toLowerCase() as 'light' | 'dark' | 'system',
        language: preferences.language,
        currency: preferences.currency,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
      })
    }
  }, [preferences])

  const saveProfile = async () => {
    try {
      await updateProfile(profileForm)
      setEditingProfile(false)
      haptic.success()
    } catch (error) {
      console.error('Failed to save profile:', error)
      haptic.error()
    }
  }

  const saveNotifications = async (newSettings: NotificationSettings) => {
    try {
      await updateNotifications(newSettings)
      setLocalNotifications(newSettings)
      haptic.light()
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await updatePreferences({
        ...newPreferences,
        theme: newPreferences.theme.toUpperCase() as 'LIGHT' | 'DARK' | 'SYSTEM'
      })
      setLocalPreferences(newPreferences)
      if (newPreferences.theme !== localPreferences.theme) {
        setTheme(newPreferences.theme)
      }
      haptic.light()
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const handleLogout = () => {
    haptic.medium()
    clearAuthState()
    router.push('/login')
  }

  const navigateToView = (view: SettingsView) => {
    haptic.light()
    setCurrentView(view)
  }

  const goBack = () => {
    haptic.light()
    setCurrentView('main')
  }

  if (!mounted || userLoading || settingsLoading || householdsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="safe-area-inset">
        <AnimatePresence mode="wait">
          {currentView === 'main' && (
            <MainSettingsView
              user={user}
              onNavigate={navigateToView}
              onLogout={handleLogout}
            />
          )}
          {currentView === 'profile' && (
            <ProfileView
              user={user}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              editingProfile={editingProfile}
              setEditingProfile={setEditingProfile}
              saving={profileLoading}
              onSave={saveProfile}
              onBack={goBack}
            />
          )}
          {currentView === 'notifications' && (
            <NotificationsView
              notifications={localNotifications}
              onSave={saveNotifications}
              onBack={goBack}
            />
          )}
          {currentView === 'appearance' && (
            <AppearanceView
              preferences={localPreferences}
              onSave={savePreferences}
              onBack={goBack}
            />
          )}
          {currentView === 'households' && (
            <HouseholdsView
              households={households}
              onBack={goBack}
              onCreateHousehold={createHousehold}
              onUpdateHousehold={updateHousehold}
              onDeleteHousehold={deleteHousehold}
              onInviteMember={inviteMember}
              onCreateKitchen={createKitchen}
              onUpdateKitchen={updateKitchen}
              onDeleteKitchen={deleteKitchen}
              loading={{
                creating,
                updating,
                deleting,
                inviting,
                creatingKitchen,
                updatingKitchen,
                deletingKitchen
              }}
            />
          )}
          {currentView === 'privacy' && (
            <PrivacyView onBack={goBack} />
          )}
          {currentView === 'support' && (
            <SupportView onBack={goBack} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Main Settings View Component
function MainSettingsView({ 
  user, 
  onNavigate, 
  onLogout 
}: { 
  user: User | null
  onNavigate: (view: SettingsView) => void
  onLogout: () => void
}) {
  return (
    <motion.div
      key="main"
      initial={{ opacity: 0, x: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-2xl shadow-lg shadow-emerald-500/10 dark:shadow-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/30">
            <Settings className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Settings</h1>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <Card className="mb-8 bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-emerald-500/30 ring-4 ring-white/50 dark:ring-slate-800/50">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white truncate mb-1">
                {user?.name || 'User'}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 truncate text-sm mb-2">
                {user?.email}
              </p>
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 text-xs px-3 py-1 shadow-lg shadow-emerald-500/30">
                ✨ Premium
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('profile')}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3 transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Menu */}
      <div className="space-y-4">
        <SettingsMenuItem
          icon={<User className="w-5 h-5" />}
          title="Profile & Account"
          description="Personal information and security"
          onClick={() => onNavigate('profile')}
        />
        
        <SettingsMenuItem
          icon={<Home className="w-5 h-5" />}
          title="Household Management"
          description="Manage kitchens and members"
          onClick={() => onNavigate('households')}
        />
        
        <SettingsMenuItem
          icon={<Bell className="w-5 h-5" />}
          title="Notifications"
          description="Alerts and reminders"
          onClick={() => onNavigate('notifications')}
        />
        
        <SettingsMenuItem
          icon={<Palette className="w-5 h-5" />}
          title="Appearance"
          description="Theme, language and display"
          onClick={() => onNavigate('appearance')}
        />
        
        <SettingsMenuItem
          icon={<Shield className="w-5 h-5" />}
          title="Privacy & Security"
          description="Data protection and privacy"
          onClick={() => onNavigate('privacy')}
        />
        
        <SettingsMenuItem
          icon={<HelpCircle className="w-5 h-5" />}
          title="Help & Support"
          description="Get help and contact support"
          onClick={() => onNavigate('support')}
        />
      </div>

      {/* Logout Button */}
      <div className="mt-10">
        <Button
          variant="destructive"
          onClick={onLogout}
          className="w-full h-14 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white font-semibold rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02]"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  )
}

// Settings Menu Item Component
function SettingsMenuItem({ 
  icon, 
  title, 
  description, 
  onClick 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <Card 
      className="bg-white/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700/50 hover:border-slate-300/60 dark:hover:border-slate-600/50 transition-all duration-300 cursor-pointer shadow-lg shadow-slate-900/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 hover:scale-[1.02] group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl text-slate-600 dark:text-slate-300 shadow-inner group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              {icon}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </CardContent>
    </Card>
  )
}

// Profile View Component
function ProfileView({ 
  user, 
  profileForm, 
  setProfileForm, 
  editingProfile, 
  setEditingProfile, 
  saving, 
  onSave, 
  onBack 
}: any) {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Profile & Account</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your personal information</p>
        </div>
      </div>

      {/* Profile Form */}
      <Card className="mb-8 bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white text-lg">Personal Information</CardTitle>
            {!editingProfile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditingProfile(true)}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Full Name</Label>
            <Input
              value={profileForm.name}
              onChange={(e) => setProfileForm((prev: typeof profileForm) => ({ ...prev, name: e.target.value }))}
              disabled={!editingProfile}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-70 shadow-sm focus:shadow-md transition-all duration-200 h-12 rounded-xl"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Email Address</Label>
            <Input
              value={profileForm.email}
              onChange={(e) => setProfileForm((prev: typeof profileForm) => ({ ...prev, email: e.target.value }))}
              disabled={!editingProfile}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-70 shadow-sm focus:shadow-md transition-all duration-200 h-12 rounded-xl"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Phone Number</Label>
            <Input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((prev: typeof profileForm) => ({ ...prev, phone: e.target.value }))}
              disabled={!editingProfile}
              placeholder="Enter phone number"
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-70 shadow-sm focus:shadow-md transition-all duration-200 h-12 rounded-xl"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-slate-700 dark:text-slate-300 font-medium">Location</Label>
            <Input
              value={profileForm.location}
              onChange={(e) => setProfileForm((prev: typeof profileForm) => ({ ...prev, location: e.target.value }))}
              disabled={!editingProfile}
              placeholder="Enter your location"
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-70 shadow-sm focus:shadow-md transition-all duration-200 h-12 rounded-xl"
            />
          </div>

          {editingProfile && (
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={onSave} 
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingProfile(false)}
                className="border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Notifications View Component
function NotificationsView({ notifications, onSave, onBack }: any) {
  const [localNotifications, setLocalNotifications] = useState(notifications)

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = { ...localNotifications, [key]: !localNotifications[key] }
    setLocalNotifications(newSettings)
    onSave(newSettings)
  }

  return (
    <motion.div
      key="notifications"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your alerts and reminders</p>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-6">
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-700/50">
            <CardTitle className="text-slate-900 dark:text-white text-lg flex items-center gap-3">
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Kitchen Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationToggle
              label="Low Stock Alerts"
              description="Get notified when items are running low"
              checked={localNotifications.lowStock}
              onChange={() => handleToggle('lowStock')}
            />
            <NotificationToggle
              label="Expiry Warnings"
              description="Alerts for items about to expire"
              checked={localNotifications.expiry}
              onChange={() => handleToggle('expiry')}
            />
            <NotificationToggle
              label="Shopping Reminders"
              description="Reminders for scheduled shopping"
              checked={localNotifications.shopping}
              onChange={() => handleToggle('shopping')}
            />
            <NotificationToggle
              label="Meal Plan Notifications"
              description="Daily meal planning reminders"
              checked={localNotifications.mealPlan}
              onChange={() => handleToggle('mealPlan')}
            />
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-700/50">
            <CardTitle className="text-slate-900 dark:text-white text-lg flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Delivery Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationToggle
              label="Push Notifications"
              description="Receive notifications on your device"
              checked={localNotifications.push}
              onChange={() => handleToggle('push')}
            />
            <NotificationToggle
              label="Email Notifications"
              description="Receive notifications via email"
              checked={localNotifications.email}
              onChange={() => handleToggle('email')}
            />
            <NotificationToggle
              label="SMS Notifications"
              description="Receive notifications via text message"
              checked={localNotifications.sms}
              onChange={() => handleToggle('sms')}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// Notification Toggle Component
function NotificationToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-700/20 dark:to-slate-700/30 border border-slate-200/60 dark:border-slate-600/30 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex-1">
        <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-emerald-500 shadow-lg"
      />
    </div>
  )
}

// Appearance View Component
function AppearanceView({ preferences, onSave, onBack }: any) {
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const handleThemeChange = (theme: string) => {
    const newPreferences = { ...localPreferences, theme }
    setLocalPreferences(newPreferences)
    onSave(newPreferences)
  }

  return (
    <motion.div
      key="appearance"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Appearance</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Customize your app experience</p>
        </div>
      </div>

      {/* Theme Selection */}
      <Card className="mb-6 bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-700/50">
          <CardTitle className="text-slate-900 dark:text-white text-lg flex items-center gap-3">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor }
            ].map((themeOption) => (
              <Button
                key={themeOption.id}
                variant={localPreferences.theme === themeOption.id ? "default" : "outline"}
                onClick={() => handleThemeChange(themeOption.id)}
                className={`flex-col gap-3 h-24 rounded-2xl transition-all duration-300 ${
                  localPreferences.theme === themeOption.id 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-xl shadow-emerald-500/30 scale-105' 
                    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50 shadow-lg shadow-slate-900/5 dark:shadow-black/20 hover:shadow-xl hover:scale-105'
                }`}
              >
                <themeOption.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{themeOption.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Preferences */}
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardHeader className="pb-4 border-b border-slate-200/60 dark:border-slate-700/50">
          <CardTitle className="text-slate-900 dark:text-white text-lg flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-700/20 dark:to-slate-700/30 border border-slate-200/60 dark:border-slate-600/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Language</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">English (US)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-700/20 dark:to-slate-700/30 border border-slate-200/60 dark:border-slate-600/30 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Currency</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">₹ Indian Rupee (INR)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Households View Component (simplified for brevity - would need full implementation)
function HouseholdsView({ households, onBack }: any) {
  return (
    <motion.div
      key="households"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Household Management</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your kitchens and members</p>
        </div>
      </div>
      
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Household Management</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Full household management features coming soon!</p>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Privacy View Component (simplified for brevity)
function PrivacyView({ onBack }: any) {
  return (
    <motion.div
      key="privacy"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Privacy & Security</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Protect your data and privacy</p>
        </div>
      </div>
      
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Privacy & Security</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Privacy and security settings coming soon!</p>
          <Badge className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 text-sm">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Support View Component (simplified for brevity)
function SupportView({ onBack }: any) {
  return (
    <motion.div
      key="support"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl p-3">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">Help & Support</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Get help and contact support</p>
        </div>
      </div>
      
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/50 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Help & Support</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Support features coming soon!</p>
          <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-4 py-2 text-sm">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  )
}