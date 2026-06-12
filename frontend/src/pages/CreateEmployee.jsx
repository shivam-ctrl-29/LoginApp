/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Upload, X, Check, ArrowRight, ArrowLeft, User, Briefcase, Tag } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const STEPS = [
  { num: 1, label: 'Basic Info', icon: User },
  { num: 2, label: 'Work Details', icon: Briefcase },
  { num: 3, label: 'Skills & Photos', icon: Tag },
];

const fieldStyle = (focused) => ({
  width: '100%', height: 44,
  padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: focused ? '1px solid var(--accent)' : '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: 14, outline: 'none',
  transition: 'var(--transition)',
  boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
});

const LabeledField = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

function CreateEmployee() {
  const navigate = useNavigate();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee',
    department_id: '', phone: '', address: '', designation: '', salary: '', joining_date: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/v1/departments`, { headers: { Authorization: token } }).then(res => setDepartments(res.data)).catch(console.error);
    axios.get(`${API_URL}/api/v1/skills`).then(res => setSkills(res.data)).catch(console.error);
  }, []);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSkillToggle = (id) => {
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email) { toast.warning('Please enter name and email'); return; }
    if (!form.department_id) { toast.warning('Please select a department'); return; }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/v1/employees`, { ...form, skill_ids: selectedSkills }, { headers: { Authorization: token } });
      const employeeId = res.data.employee.id;
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        await axios.post(`${API_URL}/api/v1/employees/upload/${employeeId}`, formData, { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } });
      }
      toast.success('Employee created successfully!');
      setTimeout(() => navigate('/employees'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!form.name || !form.email)) { toast.warning('Please enter name and email'); return; }
    if (currentStep === 2 && !form.department_id) { toast.warning('Please select a department'); return; }
    if (currentStep < 3) setCurrentStep(s => s + 1);
  };

  const inputProps = (key) => ({
    value: form[key],
    onChange: e => updateForm(key, e.target.value),
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(''),
    style: fieldStyle(focusedField === key),
  });

  return (
    <AppLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', animation: 'fadeInUp 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Add Employee</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Fill in the details to onboard a new team member</p>
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0 }}>
          {STEPS.map((step, i) => {
            const done = currentStep > step.num;
            const active = currentStep === step.num;
            const Icon = step.icon;
            return (
              <React.Fragment key={step.num}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: done ? 'var(--success)' : active ? 'var(--gradient)' : 'var(--bg-elevated)',
                    border: done ? 'none' : active ? 'none' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: done || active ? '#fff' : 'var(--text-muted)',
                    fontSize: 14, fontWeight: 700, transition: 'var(--transition)',
                    boxShadow: active ? 'var(--shadow-accent)' : 'none',
                    flexShrink: 0,
                  }}>
                    {done ? <Check size={16} /> : <span style={{ fontSize: 13 }}>{step.num}</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--text-primary)' : done ? 'var(--success)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: done ? 'var(--success)' : 'var(--border)', margin: '0 14px', minWidth: 40 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form card */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          {currentStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <LabeledField label="Full Name *">
                <input type="text" placeholder="John Doe" {...inputProps('name')} />
              </LabeledField>
              <LabeledField label="Email Address *">
                <input type="email" placeholder="john@company.com" {...inputProps('email')} />
              </LabeledField>
              <LabeledField label="Password *">
                <input type="password" placeholder="Min. 8 characters" {...inputProps('password')} />
              </LabeledField>
              <LabeledField label="Role">
                <select {...inputProps('role')}>
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </LabeledField>
            </div>
          )}

          {currentStep === 2 && (
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
              <LabeledField label="Joining Date">
                <input type="date" {...inputProps('joining_date')} />
              </LabeledField>
              <LabeledField label="Address">
                <input type="text" placeholder="City, State" {...inputProps('address')} />
              </LabeledField>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.map(skill => {
                    const selected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillToggle(skill.id)}
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

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Photos (up to 5)</label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  height: 100, borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)',
                  cursor: 'pointer', gap: 8, transition: 'var(--transition)', background: 'var(--bg-elevated)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Upload size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to upload photos</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                {previews.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    {previews.map((p, i) => (
                      <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                        <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                        <button
                          type="button" onClick={() => removeImage(i)}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={11} color="#fff" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigate('/employees')}
              style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            >
              <ArrowLeft size={15} /> {currentStep > 1 ? 'Back' : 'Cancel'}
            </button>

            {currentStep < 3 ? (
              <button
                type="button" onClick={nextStep}
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: 'var(--shadow-accent)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button" onClick={handleSubmit} disabled={loading}
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: loading ? 'none' : 'var(--shadow-accent)', transition: 'var(--transition)' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                    Saving...
                  </span>
                ) : <><Save size={15} /> Create Employee</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CreateEmployee;
