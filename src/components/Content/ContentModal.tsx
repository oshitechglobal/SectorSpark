import React, { useState, useEffect } from 'react';
import { ContentPiece, Platform, Priority, LeadMagnet } from '../../types';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Youtube, 
  Instagram, 
  Music, 
  Twitter, 
  Linkedin,
  FileText,
  Mic,
  Mail,
  GraduationCap,
  Check
} from 'lucide-react';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: Partial<ContentPiece>) => void;
  content?: ContentPiece;
  initialStage?: string;
}

const platformOptions: { value: Platform; label: string; icon: React.ComponentType<any>; emoji: string }[] = [
  { value: 'youtube', label: 'YouTube', icon: Youtube, emoji: '📺' },
  { value: 'instagram', label: 'Instagram', icon: Instagram, emoji: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: Music, emoji: '🎵' },
  { value: 'twitter', label: 'Twitter', icon: Twitter, emoji: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, emoji: '💼' },
  { value: 'blog', label: 'Blog', icon: FileText, emoji: '📝' },
  { value: 'podcast', label: 'Podcast', icon: Mic, emoji: '🎙️' },
];

const priorityOptions: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function ContentModal({ isOpen, onClose, onSave, content, initialStage }: ContentModalProps) {
  const [formData, setFormData] = useState({
    title: content?.title || '',
    platform: content?.platform || 'youtube' as Platform,
    description: content?.description || '',
    outline: content?.outline || '',
    hook: content?.hook || '',
    attention_value: content?.attention_value || '',
    priority: content?.priority || 'medium' as Priority,
    date: content?.date || '',
    will_share: content?.will_share || false,
    video_url: content?.video_url || '',
    thumbnail_url: content?.thumbnail_url || '',
    gamma_url: content?.gamma_url || '',
    gamma_pdf_url: content?.gamma_pdf_url || '',
    skool_post: content?.skool_post || '',
    email_content: content?.email_content || '',
    lead_magnets: content?.lead_magnets || [] as LeadMagnet[],
    stage: content?.stage || initialStage || 'idea',
    order: content?.order || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    if (!content) return; // Only auto-save for existing content

    const autoSaveTimer = setTimeout(() => {
      if (formData.title.trim()) {
        setIsAutoSaving(true);
        // Simulate auto-save
        setTimeout(() => setIsAutoSaving(false), 1000);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData, content]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: content?.title || '',
        platform: content?.platform || 'youtube' as Platform,
        description: content?.description || '',
        outline: content?.outline || '',
        hook: content?.hook || '',
        attention_value: content?.attention_value || '',
        priority: content?.priority || 'medium' as Priority,
        date: content?.date || '',
        will_share: content?.will_share || false,
        video_url: content?.video_url || '',
        thumbnail_url: content?.thumbnail_url || '',
        gamma_url: content?.gamma_url || '',
        gamma_pdf_url: content?.gamma_pdf_url || '',
        skool_post: content?.skool_post || '',
        email_content: content?.email_content || '',
        lead_magnets: content?.lead_magnets || [] as LeadMagnet[],
        stage: content?.stage || initialStage || 'idea',
        order: content?.order || 0,
      });
      setErrors({});
    }
  }, [isOpen, content, initialStage]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.platform) {
      newErrors.platform = 'Platform is required';
    }

    // URL validation
    const urlFields = ['video_url', 'thumbnail_url', 'gamma_url', 'gamma_pdf_url'];
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as string;
      if (value && !isValidUrl(value)) {
        newErrors[field] = 'Please enter a valid URL';
      }
    });

    // Lead magnet validation
    formData.lead_magnets.forEach((magnet, index) => {
      if (magnet.name && !magnet.url) {
        newErrors[`lead_magnet_url_${index}`] = 'URL is required when name is provided';
      }
      if (magnet.url && !isValidUrl(magnet.url)) {
        newErrors[`lead_magnet_url_${index}`] = 'Please enter a valid URL';
      }
    });

    // Date validation (optional - can't be in the past)
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Publication date cannot be in the past';
      }
    }

    return newErrors;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addLeadMagnet = () => {
    setFormData(prev => ({
      ...prev,
      lead_magnets: [...prev.lead_magnets, { name: '', url: '' }]
    }));
  };

  const removeLeadMagnet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lead_magnets: prev.lead_magnets.filter((_, i) => i !== index)
    }));
    // Clear related errors
    const newErrors = { ...errors };
    delete newErrors[`lead_magnet_url_${index}`];
    setErrors(newErrors);
  };

  const updateLeadMagnet = (index: number, field: 'name' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      lead_magnets: prev.lead_magnets.map((lm, i) => 
        i === index ? { ...lm, [field]: value } : lm
      )
    }));
    
    // Clear related errors
    if (field === 'url' && errors[`lead_magnet_url_${index}`]) {
      setErrors(prev => ({ ...prev, [`lead_magnet_url_${index}`]: '' }));
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveAndMoveNext = () => {
    const newErrors = validateForm();
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      const stages = ['idea', 'outline', 'writing', 'design', 'film', 'edit', 'publish'];
      const currentIndex = stages.indexOf(formData.stage);
      const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : formData.stage;
      
      onSave({ ...formData, stage: nextStage });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm p-6 border-b border-gray-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gradient">
                {content ? 'Edit Content' : 'Create New Content'}
              </h2>
              {isAutoSaving && (
                <p className="text-sm text-cyan-400 mt-1">Auto-saving...</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800/30 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter compelling content title..."
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platform *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => handleChange('platform', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.platform ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  {platformOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
                {errors.platform && <p className="text-red-400 text-sm mt-1">{errors.platform}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.date ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="will_share"
                  checked={formData.will_share}
                  onChange={(e) => handleChange('will_share', e.target.checked)}
                  className="w-5 h-5 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <label htmlFor="will_share" className="text-sm font-medium text-gray-300">
                  Will Share
                </label>
              </div>
            </div>
          </div>

          {/* Content Details Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800/30 pb-2">
              Content Details
            </h3>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Hook/Opening
                </label>
                {formData.hook && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.hook, 'hook')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'hook' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'hook' ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <textarea
                value={formData.hook}
                onChange={(e) => handleChange('hook', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Attention-grabbing opening that hooks your audience..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Content Outline
                </label>
                {formData.outline && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.outline, 'outline')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'outline' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'outline' ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <textarea
                value={formData.outline}
                onChange={(e) => handleChange('outline', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Main structure and key points of your content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Key Value/Message
              </label>
              <input
                type="text"
                value={formData.attention_value}
                onChange={(e) => handleChange('attention_value', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                placeholder="Main takeaway or value proposition..."
              />
            </div>
          </div>

          {/* Media & Resources Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800/30 pb-2">
              Media & Resources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Video URL
                  </label>
                  {formData.video_url && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(formData.video_url, 'video_url')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                    >
                      {copiedField === 'video_url' ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedField === 'video_url' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.video_url ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="YouTube/video link..."
                />
                {errors.video_url && <p className="text-red-400 text-sm mt-1">{errors.video_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => handleChange('thumbnail_url', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.thumbnail_url ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Custom thumbnail..."
                />
                {errors.thumbnail_url && <p className="text-red-400 text-sm mt-1">{errors.thumbnail_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gamma Presentation
                </label>
                <input
                  type="url"
                  value={formData.gamma_url}
                  onChange={(e) => handleChange('gamma_url', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.gamma_url ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Gamma slides link..."
                />
                {errors.gamma_url && <p className="text-red-400 text-sm mt-1">{errors.gamma_url}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gamma PDF
                </label>
                <input
                  type="url"
                  value={formData.gamma_pdf_url}
                  onChange={(e) => handleChange('gamma_pdf_url', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                    errors.gamma_pdf_url ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="PDF export link..."
                />
                {errors.gamma_pdf_url && <p className="text-red-400 text-sm mt-1">{errors.gamma_pdf_url}</p>}
              </div>
            </div>
          </div>

          {/* Platform-Specific Content Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-800/30 pb-2">
              Platform-Specific Content
            </h3>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  🏫 Skool Post Content
                </label>
                {formData.skool_post && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.skool_post, 'skool_post')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'skool_post' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'skool_post' ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <textarea
                value={formData.skool_post}
                onChange={(e) => handleChange('skool_post', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Content for Skool community post..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  📧 Email Newsletter Content
                </label>
                {formData.email_content && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.email_content, 'email_content')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                  >
                    {copiedField === 'email_content' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedField === 'email_content' ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <textarea
                value={formData.email_content}
                onChange={(e) => handleChange('email_content', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                placeholder="Email newsletter content..."
              />
            </div>
          </div>

          {/* Lead Magnets Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white border-b border-gray-800/30 pb-2">
                Lead Magnets
              </h3>
              <button
                type="button"
                onClick={addLeadMagnet}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Lead Magnet</span>
              </button>
            </div>

            {formData.lead_magnets.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No lead magnets added yet. Click "Add Lead Magnet" to get started.</p>
              </div>
            )}

            {formData.lead_magnets.map((magnet, index) => (
              <div key={index} className="glass-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Lead Magnet {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeLeadMagnet(index)}
                    className="text-red-400 hover:text-red-300 p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={magnet.name}
                    onChange={(e) => updateLeadMagnet(index, 'name', e.target.value)}
                    placeholder="Lead magnet name"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                  <div className="relative">
                    <input
                      type="url"
                      value={magnet.url}
                      onChange={(e) => updateLeadMagnet(index, 'url', e.target.value)}
                      placeholder="https://..."
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                        errors[`lead_magnet_url_${index}`] ? 'border-red-500' : 'border-gray-700'
                      }`}
                    />
                    {magnet.url && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(magnet.url, `lead_magnet_${index}`)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {copiedField === `lead_magnet_${index}` ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    )}
                    {errors[`lead_magnet_url_${index}`] && (
                      <p className="text-red-400 text-sm mt-1">{errors[`lead_magnet_url_${index}`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800/30">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            <div className="flex items-center space-x-4">
              {!content && (
                <button
                  type="button"
                  onClick={handleSaveAndMoveNext}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>Save & Move to Next Stage</span>
                </button>
              )}
              
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={18} />
                <span>{content ? 'Update' : 'Create'} Content</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}