"use client";

import { motion } from "framer-motion";
import {
  Home,
  Users,
  Settings as SettingsIcon,
  Globe2,
  Bell,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SettingsSkeleton } from "@/components/skeleton-loaders";
import { useState } from "react";
// Mock data for settings - will be replaced with API data
const mockHouseholds = [
  {
    id: "hh-1",
    name: "Vishwakarma Family",
    plan: "pro",
    kitchens: ["k-1", "k-2"],
  },
];

const mockKitchens = [
  {
    id: "k-1",
    name: "Home Kitchen",
    location: "Home",
    isPrimary: true,
  },
  {
    id: "k-2",
    name: "Office Tiffin Kitchen",
    location: "Office",
  },
];

const mockMembers = [
  { id: "u-1", name: "Chandan", role: "OWNER" },
  { id: "u-2", name: "Mummy", role: "MEMBER" },
  { id: "u-3", name: "Papa", role: "VIEWER" },
];

const mockUserSettings = {
  id: "settings-1",
  preferredTheme: "system",
  language: "en",
  defaultKitchenId: "k-1",
  notificationsEmail: true,
  notificationsPush: true,
};

export function SettingsTab() {
  const [isLoading, setIsLoading] = useState(false)
  const household = mockHouseholds[0];
  const settings = mockUserSettings;

  // Show skeleton while loading
  if (isLoading) {
    return <SettingsSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <h2 className="text-sm sm:text-xl md:text-2xl font-bold">Settings</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-900/40">
              <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
            </span>
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground max-w-lg">
            Manage your household, kitchens, members and basic preferences.
            Currently all values are mock and will later come from the API.
          </p>
        </div>
        <Badge className="rounded-full bg-muted border border-muted-foreground/10 text-[8px] sm:text-xs px-2 py-1">
          Plan: {household.plan === "pro" ? "Pro" : "Free"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
        {/* Household */}
        <Card className="card-premium lg:col-span-2">
          <CardHeader className="pb-2 sm:pb-4 flex flex-row items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Home className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-[10px] sm:text-lg">
                  {household.name}
                </CardTitle>
                <p className="text-[9px] sm:text-sm text-muted-foreground">
                  {mockKitchens.length} kitchens · {mockMembers.length} members
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-full h-6 sm:h-8 text-[8px] sm:text-xs px-2 sm:px-3">
              Manage subscription
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-5 pt-0">
            {/* Kitchens */}
            <div>
              <p className="text-[8px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5 sm:mb-2">
                Kitchens
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {mockKitchens.map((k) => (
                  <div
                    key={k.id}
                    className="px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border bg-background flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-sm"
                  >
                    <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Home className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-[9px] sm:text-sm">{k.name}</p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground">
                        {k.location}
                        {k.isPrimary ? " · Default" : ""}
                      </p>
                    </div>
                    {k.isPrimary && (
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Members */}
            <div>
              <p className="text-[8px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1.5 sm:mb-2">
                Members
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {mockMembers.map((m) => (
                  <div
                    key={m.id}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border bg-background text-[9px] sm:text-sm flex items-center gap-1.5 sm:gap-2"
                  >
                    <Users className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-indigo-500" />
                    <span>{m.name}</span>
                    <span className="text-[8px] sm:text-[10px] px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-full bg-muted text-muted-foreground">
                      {m.role}
                    </span>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 sm:h-8 text-[8px] sm:text-xs rounded-full px-2 sm:px-3"
                >
                  + Invite member
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="card-premium">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-[10px] sm:text-lg">
              Preferences (mock)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-4 text-[9px] sm:text-sm pt-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Globe2 className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-[9px] sm:text-sm">Language</p>
                <p className="text-muted-foreground text-[8px] sm:text-xs">
                  {settings.language === "en" ? "English" : "Hindi"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-[9px] sm:text-sm">Theme</p>
                <p className="text-muted-foreground capitalize text-[8px] sm:text-xs">
                  {settings.preferredTheme}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-1.5 sm:gap-2">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-[9px] sm:text-sm">Notifications</p>
                <p className="text-muted-foreground text-[8px] sm:text-xs">
                  Email: {settings.notificationsEmail ? "On" : "Off"} · Push:{" "}
                  {settings.notificationsPush ? "On" : "Off"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-1 rounded-lg sm:rounded-xl text-[8px] sm:text-xs h-6 sm:h-8"
            >
              Open profile & preferences (live later)
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
