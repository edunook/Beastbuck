import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { Building2, Plus, Edit2, Archive, Trash2, User, Users, Search, X } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function DepartmentManagement() {
  const { user, roleData } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', leaderId: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await GovernanceService.createDepartment(formData, user.uid);
      await loadDepartments();
      setShowModal(false);
      setFormData({ name: '', description: '', leaderId: '' });
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDepartment) return;
    try {
      await GovernanceService.updateDepartment(editingDepartment.id, formData);
      await loadDepartments();
      setShowModal(false);
      setEditingDepartment(null);
      setFormData({ name: '', description: '', leaderId: '' });
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Failed to update department');
    }
  };

  const handleArchive = async (departmentId) => {
    if (!confirm('Are you sure you want to archive this department?')) return;
    try {
      await GovernanceService.archiveDepartment(departmentId);
      await loadDepartments();
    } catch (error) {
      console.error('Error archiving department:', error);
      alert('Failed to archive department');
    }
  };

  const handleDelete = async (departmentId) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return;
    try {
      await GovernanceService.deleteDepartment(departmentId);
      await loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      leaderId: department.leaderId || '',
    });
    setShowModal(true);
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Department Management is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredDepartments = departments.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Department Management" 
        description="Create and manage organizational departments."
        hero={true}
        action={
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Department
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments..."
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No departments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDepartments.map((department) => (
                <div
                  key={department.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{department.name}</h3>
                          {department.description && (
                            <p className="text-text-muted text-sm">{department.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{department.memberCount || 0} Members</span>
                        </div>
                        {department.leaderId && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Has Leader</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => openEditModal(department)}
                        size="sm"
                        variant="secondary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleArchive(department.id)}
                        size="sm"
                        variant="secondary"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(department.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingDepartment(null);
                setFormData({ name: '', description: '', leaderId: '' });
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </h2>

            <form onSubmit={editingDepartment ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Department Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter department name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter department description"
                  rows={3}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Leader ID (optional)</label>
                <Input
                  value={formData.leaderId}
                  onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
                  placeholder="Enter leader user ID"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDepartment(null);
                    setFormData({ name: '', description: '', leaderId: '' });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingDepartment ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
