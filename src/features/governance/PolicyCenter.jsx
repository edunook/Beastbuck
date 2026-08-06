import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';
import { GovernanceService } from '../../services/firebase/governance';
import { FileText, Plus, Edit2, Send, Search, X, CheckCircle, Clock } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';

export default function PolicyCenter() {
  const { user, roleData } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'General' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getPolicies();
      setPolicies(data);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await GovernanceService.createPolicy(formData, user.uid);
      await loadPolicies();
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'General' });
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Failed to create policy');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingPolicy) return;
    try {
      await GovernanceService.updatePolicy(editingPolicy.id, formData);
      await loadPolicies();
      setShowModal(false);
      setEditingPolicy(null);
      setFormData({ title: '', description: '', category: 'General' });
    } catch (error) {
      console.error('Error updating policy:', error);
      alert('Failed to update policy');
    }
  };

  const handlePublish = async (policyId) => {
    if (!confirm('Are you sure you want to publish this policy?')) return;
    try {
      await GovernanceService.publishPolicy(policyId);
      await loadPolicies();
    } catch (error) {
      console.error('Error publishing policy:', error);
      alert('Failed to publish policy');
    }
  };

  const openEditModal = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      description: policy.description || '',
      category: policy.category || 'General',
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'PUBLISHED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Policy Center is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredPolicies = policies.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Policy Center" 
        description="Create and manage organizational policies."
        hero={true}
        action={
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Policy
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
              placeholder="Search policies..."
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No policies found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(policy.status))}>
                          {policy.status === 'DRAFT' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          <span>{policy.status}</span>
                        </div>
                        <span className="text-text-muted text-sm">{policy.category}</span>
                      </div>

                      <h3 className="font-bold text-white text-lg mb-2">{policy.title}</h3>
                      <p className="text-text-soft text-sm line-clamp-2">{policy.description}</p>

                      {policy.publishedAt && (
                        <p className="text-xs text-text-muted mt-2">
                          Published {new Date(policy.publishedAt?.toDate?.() || policy.publishedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => openEditModal(policy)}
                        size="sm"
                        variant="secondary"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {policy.status === 'DRAFT' && (
                        <Button
                          onClick={() => handlePublish(policy.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Publish
                        </Button>
                      )}
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
                setEditingPolicy(null);
                setFormData({ title: '', description: '', category: 'General' });
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPolicy ? 'Edit Policy' : 'Create Policy'}
            </h2>

            <form onSubmit={editingPolicy ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter policy title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter policy description"
                  rows={4}
                  required
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                >
                  <option value="General">General</option>
                  <option value="Membership">Membership</option>
                  <option value="Conduct">Conduct</option>
                  <option value="Security">Security</option>
                  <option value="Privacy">Privacy</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPolicy(null);
                    setFormData({ title: '', description: '', category: 'General' });
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
                  {editingPolicy ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
