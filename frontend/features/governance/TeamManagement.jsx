import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { BriefcaseBusiness, Plus, Edit2, Trash2, Users, Search, ArrowRight, Building2, X } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function TeamManagement() {
  const { user, roleData } = useAuth();
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', departmentId: '', leaderId: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teamsData, departmentsData] = await Promise.all([
        GovernanceService.getTeams(),
        GovernanceService.getDepartments(),
      ]);
      setTeams(teamsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await GovernanceService.createTeam(formData, user.uid);
      await loadData();
      setShowModal(false);
      setFormData({ name: '', description: '', departmentId: '', leaderId: '' });
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTeam) return;
    try {
      await GovernanceService.updateTeam(editingTeam.id, formData);
      await loadData();
      setShowModal(false);
      setEditingTeam(null);
      setFormData({ name: '', description: '', departmentId: '', leaderId: '' });
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team');
    }
  };

  const handleDelete = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    try {
      await GovernanceService.deleteTeam(teamId);
      await loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const openEditModal = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      departmentId: team.departmentId || '',
      leaderId: team.leaderId || '',
    });
    setShowModal(true);
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <BriefcaseBusiness className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Team Management is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredTeams = teams.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Team Management" 
        description="Create and manage organizational teams."
        hero={true}
        action={
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
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
              placeholder="Search teams..."
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <BriefcaseBusiness className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No teams found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeams.map((team) => {
                const department = departments.find(d => d.id === team.departmentId);
                return (
                  <div
                    key={team.id}
                    className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <BriefcaseBusiness className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{team.name}</h3>
                            {team.description && (
                              <p className="text-text-muted text-sm">{team.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{team.memberCount || 0} Members</span>
                          </div>
                          {department && (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{department.name}</span>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => openEditModal(team)}
                          size="sm"
                          variant="secondary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(team.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                setEditingTeam(null);
                setFormData({ name: '', description: '', departmentId: '', leaderId: '' });
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingTeam ? 'Edit Team' : 'Create Team'}
            </h2>

            <form onSubmit={editingTeam ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Team Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter team description"
                  rows={3}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
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
                    setEditingTeam(null);
                    setFormData({ name: '', description: '', departmentId: '', leaderId: '' });
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
                  {editingTeam ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
