/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, Upload, X, Check, ArrowLeft } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const fieldStyle = (focused) => ({
  width: '100%', height: 44, padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: focused ? '1px solid var(--accent)' : '1px solid var(--border)',
  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', transition: 'var(--transition)',
  boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
});

const LabeledField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [focusedField, setFocusedField] = useState('');
  const [form, setForm] = useState({
    department_id: '', phone: '', address: '', designation: '', salary: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      axios.get(`${API_URL}/api/v1/departments`),
      axios.get(`${API_URL}/api/v1/skills`),
      axios.get(`${API_URL}/api/v1/employees/${id}`, { headers: { Authorization: token } }),
    ]).then(([deptRes, skillRes, empRes]) => {
      setDepartments(deptRes.data);
      setSkills(skillRes.data);
      const emp = empRes.data.employee || empRes.data;
      setForm({ department_id: emp.department_id || '', phone: emp.phone || '', address: emp.address || '', designation: emp.designation || '', salary: emp.salary || '' });
      setSelectedSkills((emp.skills || []).map(s => s.id));
      setExistingImages(emp.images || []);
    }).catch(console.error).finally(() => setFetching(false));
  }, [id]);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSkillToggle = (skillId) => {
    setSelectedSkills(prev => prev.includes(skillId) ? prev.filter(s => s !== skillId) : [...prev, skillId]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeNewImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.department_id) { toast.warning('Please select a department'); return; }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/api/v1/employees/${id}`, { ...form, skill_ids: selectedSkills }, { headers: { Authorization: token } });
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        await axios.post(`${API_URL}/api/v1/employees/upload/${id}`, formData, { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } });
      }
      toast.success('Employee updated successfully!');
      setTimeout(() => navigate('/employees'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (key) => ({
    value: form[key],
    onChange: e => updateForm(key, e.target.value),
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(''),
    style: fieldStyle(focusedField === key),
  });

  if (fetching) {
    return <AppLayout><div style={{ display: 'flex', justifyContent: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 14 }}>Loading employee...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => navigate('/employees')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={15} /> Back to Employees
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Edit Employee</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Update employee information and work details</p>
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 18 }}>Work Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <LabeledField label="Department *">
                <select {...inputProps('department_id')}>
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.department_name || d.name}</option>)}
                </select>
              </LabeledField>
              <LabeledField label="Designation">
                <input type="text" placeholder="e.g. Senior Engineer" {...inputProps('designation')} />
              </LabeledField>
              <LabeledField label="Phone">
                <input type="tel" placeholder="+91 9876543210" {...inputProps('phone')} />
              </LabeledField>
              <LabeledField label="Salary (₹)">
                <input type="number" placeholder="50000" {...inputProps('salary')} />
              </LabeledField>
              <div style={{ gridColumn: '1 / -1' }}>
                <LabeledField label="Address">
                  <input type="text" placeholder="City, State" {...inputProps('address')} />
                </LabeledField>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map(skill => {
                const selected = selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id} type="button" onClick={() => handleSkillToggle(skill.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-full)',
                      border: selected ? 'none' : '1px solid var(--border)',
                      background: selected ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: 12, fontWeight: selected ? 600 : 400, cursor: 'pointer',
                      transition: 'var(--transition)',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {selected && <Check size={11} />}{skill.skill_name || skill.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Photos</h3>
            {existingImages.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <img key={i} src={img} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                ))}
              </div>
            )}
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 90, borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)', cursor: 'pointer', gap: 6, background: 'var(--bg-elevated)', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Upload size={18} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload new photos</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', width: 66, height: 66 }}>
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    <button type="button" onClick={() => removeNewImage(i)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={10} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button onClick={() => navigate('/employees')} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            >
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: loading ? 'none' : 'var(--shadow-accent)', transition: 'var(--transition)' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                  Saving...
                </span>
              ) : <><Save size={15} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default EditEmployee;
