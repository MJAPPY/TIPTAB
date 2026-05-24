"use client";

import { useState } from 'react';
import { AdminUser } from '@/types/xpr';
import { ROOT_ADMINS } from '@/constants/xpr';

export const useXprAdmin = (activeActor: string | null) => {
  const [adminsList, setAdminsList] = useState<AdminUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tiptab_admins_list");
      let list = saved ? JSON.parse(saved) : [];
      ROOT_ADMINS.forEach(handle => {
        if (!list.find((a: AdminUser) => a.handle === handle)) {
          list.push({ id: `root_${handle}`, handle, role: "super", isPermanent: true });
        }
      });
      return list;
    }
    return ROOT_ADMINS.map(h => ({ id: `root_${h}`, handle: h, role: "super", isPermanent: true }));
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tiptab_maintenance") === "true";
    return false;
  });

  const [networkAlert, setNetworkAlert] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("tiptab_network_alert");
    return null;
  });

  const currentAdminObj = activeActor ? adminsList.find(a => a.handle === activeActor) : null;
  const isCurrentAdminPermanent = currentAdminObj?.isPermanent === true || (activeActor && ROOT_ADMINS.includes(activeActor));

  const setMaintenanceMode = (status: boolean) => {
    if (!currentAdminObj || currentAdminObj.role !== 'super') return;
    setIsMaintenanceMode(status);
    localStorage.setItem("tiptab_maintenance", status.toString());
  };

  const broadcastAlert = (message: string | null) => {
    if (!currentAdminObj) return;
    setNetworkAlert(message);
    if (message) localStorage.setItem("tiptab_network_alert", message);
    else localStorage.removeItem("tiptab_network_alert");
  };

  const addAdmin = (handle: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (!isCurrentAdminPermanent) return;
    const cleanHandle = handle.toLowerCase().trim().replace('@', '');
    if (!cleanHandle || adminsList.some(a => a.handle === cleanHandle)) return;
    const newAdmin: AdminUser = { id: "admin_" + Date.now(), handle: cleanHandle, role };
    const updated = [...adminsList, newAdmin];
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const removeAdmin = (id: string) => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target) return;
    if (ROOT_ADMINS.includes(target.handle)) return;
    const updated = adminsList.filter(a => a.id !== id);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const updateAdminRole = (id: string, role: 'super' | 'moderator' | 'treasurer') => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target || ROOT_ADMINS.includes(target.handle)) return;
    const updated = adminsList.map(a => a.id === id ? { ...a, role, isPermanent: role !== 'super' ? false : a.isPermanent } : a);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  const makeAdminPermanent = (id: string, status: boolean) => {
    if (!isCurrentAdminPermanent) return;
    const target = adminsList.find(a => a.id === id);
    if (!target || ROOT_ADMINS.includes(target.handle)) return;
    const updated = adminsList.map(a => a.id === id ? { ...a, isPermanent: status, role: status ? ('super' as const) : a.role } : a);
    setAdminsList(updated);
    localStorage.setItem("tiptab_admins_list", JSON.stringify(updated));
  };

  return {
    adminsList, isMaintenanceMode, networkAlert, currentAdminObj, isCurrentAdminPermanent,
    setMaintenanceMode, broadcastAlert, addAdmin, removeAdmin, updateAdminRole, makeAdminPermanent
  };
};