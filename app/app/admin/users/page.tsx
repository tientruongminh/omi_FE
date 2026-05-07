'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, Search, Pencil, X, Loader2 } from 'lucide-react';
import { adminApi, AdminUser, type UserActivityAnalytics } from '@/entities/admin/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', status: 'active' as AdminUser['status'], role: 'student' as AdminUser['role'] });
  const [saving, setSaving] = useState(false);
  const [activityUser, setActivityUser] = useState<AdminUser | null>(null);
  const [activityData, setActivityData] = useState<UserActivityAnalytics | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getUsers(100, 0);
      setUsers(res.users ?? []);
    } catch {
      setError('Không thể tải danh sách học viên.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatActiveTime = (seconds?: number) => {
    const total = seconds ?? 0;
    if (total < 60) return `${total}s`;
    const minutes = Math.floor(total / 60);
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes ? ` ${remainingMinutes}p` : ''}`;
  };

  const openActivity = async (u: AdminUser) => {
    setActivityUser(u);
    setActivityData(null);
    setActivityLoading(true);
    try {
      const data = await adminApi.getUserActivity(u.user_id);
      setActivityData(data);
    } catch {
      setError('Không thể tải dữ liệu vòng đời sử dụng.');
    } finally {
      setActivityLoading(false);
    }
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, status: u.status, role: u.role });
    setShowModal(true);
  };

  const handleInlineRoleChange = async (u: AdminUser, role: AdminUser['role']) => {
    if (role === u.role) return;
    const previousRole = u.role;
    setUsers(prev => prev.map(item => item.id === u.id ? { ...item, role } : item));
    try {
      await adminApi.updateUserRole(u.user_id, role);
    } catch {
      setUsers(prev => prev.map(item => item.id === u.id ? { ...item, role: previousRole } : item));
      setError('Không thể cập nhật role. Vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      if (form.status !== editUser.status) {
        await adminApi.updateUserStatus(editUser.user_id, form.status);
      }
      if (form.role !== editUser.role) {
        await adminApi.updateUserRole(editUser.user_id, form.role);
      }
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, status: form.status, role: form.role } : u));
      setShowModal(false);
    } catch {
      setError('Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Học viên</h1>
          <p className="text-[13px] text-[#5A5C58] mt-0.5">{users.length} học viên trong hệ thống</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-white text-[13px] text-[#2D2D2D] placeholder:text-[#999] focus:outline-none focus:border-[#6B2D3E] transition-colors"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-[#6B2D3E]" size={24} />
        </div>
      ) : (
        <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E5E7EB] bg-[#FAFAF8]">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Họ tên</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Email</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Vai trò</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Active time</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {filtered.map((u) => (
                <tr key={u.id} onClick={() => openActivity(u)} className="hover:bg-[#FAFAF8] transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-[#6B2D3E]">
                          {u.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-[13px] font-semibold text-[#2D2D2D]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[#5A5C58]">{u.email}</td>
                  <td className="px-5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.role}
                      onChange={(e) => handleInlineRoleChange(u, e.target.value as AdminUser['role'])}
                      className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] focus:outline-none focus:border-[#4338CA] cursor-pointer"
                      title="Đổi role nhanh"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      u.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEE2E2] text-[#DC2626]'
                    }`}>
                      {u.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-[#2D2D2D]">{formatActiveTime(u.active_seconds)}</span>
                      <span className="text-[11px] text-[#999]">
                        {u.online
                          ? `Đang online${u.current_path ? ` • ${u.current_path}` : ''}`
                          : u.last_seen_at
                            ? `Lần cuối ${new Date(u.last_seen_at).toLocaleString('vi-VN')}`
                            : 'Chưa ghi nhận'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); openActivity(u); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] text-[#5A5C58] transition-colors cursor-pointer" title="Xem analytics">
                        <BarChart3 size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(u); }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] text-[#5A5C58] transition-colors cursor-pointer" title="Sửa user">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity Analytics Modal */}
      <AnimatePresence>
        {activityUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setActivityUser(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-full max-w-[900px] max-h-[88vh] overflow-auto shadow-xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[20px] font-black text-[#1A1A1A] flex items-center gap-2">
                    <Activity size={20} className="text-[#6B2D3E]" />
                    Vòng đời sử dụng sản phẩm
                  </h3>
                  <p className="text-[13px] text-[#5A5C58] mt-1">{activityUser.name} • {activityUser.email}</p>
                </div>
                <button onClick={() => setActivityUser(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer">
                  <X size={18} className="text-[#5A5C58]" />
                </button>
              </div>

              {activityLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-[#6B2D3E]" size={26} />
                </div>
              ) : activityData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Tổng active', value: formatActiveTime(activityData.total_active_seconds) },
                      { label: 'Số session', value: String(activityData.session_count) },
                      { label: 'Trạng thái', value: activityData.online ? 'Online' : 'Offline' },
                      { label: 'Lần cuối', value: activityData.last_seen_at ? new Date(activityData.last_seen_at).toLocaleString('vi-VN') : 'N/A' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFAF8] p-4">
                        <p className="text-[11px] uppercase tracking-wider text-[#5A5C58] font-bold">{item.label}</p>
                        <p className="mt-1 text-[18px] font-black text-[#1A1A1A]">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-3">Biểu đồ thời gian theo khu vực sản phẩm</h4>
                    <div className="space-y-3">
                      {activityData.paths.length === 0 ? (
                        <p className="text-[13px] text-[#999]">Chưa có dữ liệu path.</p>
                      ) : activityData.paths.map((p) => {
                        const pct = activityData.total_active_seconds > 0 ? Math.max(3, Math.round((p.active_seconds / activityData.total_active_seconds) * 100)) : 0;
                        return (
                          <div key={p.path}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-semibold text-[#2D2D2D]">{p.path}</span>
                              <span className="text-[12px] text-[#5A5C58]">{formatActiveTime(p.active_seconds)} • {p.sessions} session</span>
                            </div>
                            <div className="h-3 rounded-full bg-[#F0F0F0] overflow-hidden border border-[#E5E7EB]">
                              <div className="h-full rounded-full bg-[#6B2D3E]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-3">Timeline session gần đây</h4>
                    <div className="relative pl-4 border-l-2 border-[#E5E7EB] space-y-4">
                      {activityData.sessions.length === 0 ? (
                        <p className="text-[13px] text-[#999]">Chưa có session nào.</p>
                      ) : activityData.sessions.map((s) => (
                        <div key={s.session_id} className="relative">
                          <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white ${s.is_active ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'}`} />
                          <div className="rounded-xl border border-[#E5E7EB] p-3 bg-[#FAFAF8]">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[13px] font-bold text-[#1A1A1A]">{s.last_path || '/'}</p>
                              <span className="text-[11px] font-bold text-[#6B2D3E]">{formatActiveTime(s.active_seconds)}</span>
                            </div>
                            <p className="text-[11px] text-[#5A5C58] mt-1">
                              {new Date(s.first_seen_at).toLocaleString('vi-VN')} → {new Date(s.last_seen_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#999] py-10 text-center">Không có dữ liệu.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && editUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-6 w-[420px] shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">Sửa người dùng</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F5F0EB] cursor-pointer">
                  <X size={18} className="text-[#5A5C58]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Họ tên</label>
                  <p className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-[#FAFAF8] text-[13px] text-[#5A5C58]">{editUser.name}</p>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Email</label>
                  <p className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] bg-[#FAFAF8] text-[13px] text-[#5A5C58]">{editUser.email}</p>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Vai trò</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm(f => ({ ...f, role: e.target.value as AdminUser['role'] }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#5A5C58] mb-1 block">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value as AdminUser['status'] }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] bg-white cursor-pointer"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#5A5C58] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
