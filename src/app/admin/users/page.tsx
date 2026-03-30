"use client";

import { useCallback, useEffect, useState } from "react";
import type { Role } from "@prisma/client";
import InputWithIcon from "@/components/ui/InputWithIcon";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import Icon from "@/components/ui/Icon";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  portfolioCount: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${search}&role=${roleFilter}&page=${page}&pageSize=25`);
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const toggleUserStatus = useCallback(async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return;
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      void fetchUsers();
    } catch (e) {
      console.error(e);
    }
  }, [fetchUsers]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            User Management
          </h1>
          <p className="text-on-surface-variant text-sm">
            View, filter, and manage platform users.
          </p>
        </div>
        <button className="px-4 py-2 signature-cta text-white font-label font-bold text-xs tracking-wider uppercase rounded-md shadow-md hover:opacity-90 transition-opacity">
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        <InputWithIcon
          icon="search"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          wrapperClassName="min-w-[200px] flex-1"
          inputClassName="h-11 bg-surface-container-low border-transparent focus:bg-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2 px-4 bg-surface-container-low border border-transparent rounded-lg focus:bg-white focus:border-primary outline-none text-sm min-w-[150px]"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-xs font-label uppercase tracking-wider border-b border-outline-variant/20">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Portfolios</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <LoadingIndicator label="Loading users..." />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-surface-container-lowest/50 group transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.name?.[0] || user.email?.[0] || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-on-surface">{user.name || "Unnamed"}</p>
                          <p className="text-xs text-on-surface-variant">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-error/10 text-error' : user.role === 'MODERATOR' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold ${user.isActive ? 'text-emerald-600' : 'text-error'}`}>
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-error'}`}></span>
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium">{user.portfolioCount}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`p-1.5 rounded bg-surface-container hover:bg-surface-container-highest transition-colors ${user.isActive ? 'text-error' : 'text-emerald-600'}`}
                          title={user.isActive ? "Suspend User" : "Activate User"}
                        >
                          <Icon name={user.isActive ? "block" : "check_circle"} className="text-[18px]" />
                        </button>
                        <button className="p-1.5 rounded bg-surface-container hover:bg-surface-container-highest transition-colors text-primary" title="Edit Role">
                          <Icon name="admin_panel_settings" className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-md border border-outline-variant/20 text-sm font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-md border border-outline-variant/20 text-sm font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
