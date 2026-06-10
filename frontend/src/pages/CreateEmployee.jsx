import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, Upload, X, Check, ArrowRight, ArrowLeft, User, Briefcase, Tag } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

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
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department_id: '',
    phone: '',
    address: '',
    designation: '',
    salary: '',
    joining_date: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/v1/departments`, { headers: { Authorization: token } }).then(res => setDepartments(res.data)).catch(console.error);
    axios.get(`${API_URL}/api/v1/skills`).then(res => setSkills(res.data)).catch(console.error);
  }, []);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSkillToggle = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
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
    if (!form.name || !form.email) {
      toast.warning('Please enter name and email');
      return;
    }
    if (!form.department_id) {
      toast.warning('Please select a department');
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/v1/employees`, {
        ...form,
        skill_ids: selectedSkills,
      }, { headers: { Authorization: token } });

      const employeeId = res.data.employee.id;

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        await axios.post(`${API_URL}/api/v1/employees/upload/${employeeId}`, formData, {
          headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        });
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
    if (currentStep === 1 && (!form.name || !form.email)) {
      toast.warning('Please enter name and email');
      return;
    }
    if (currentStep === 2 && !form.department_id) {
      toast.warning('Please select a department');
      return;
    }
    setCurrentStep(prev => Math.min(3, prev + 1));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const steps = [
    { id: 1, label: 'Basic Info', icon: User },
    { id: 2, label: 'Work Details', icon: Briefcase },
    { id: 3, label: 'Skills', icon: Tag },
  ];

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              Create Employee
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Add a new team member to your organization
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {/* Connecting Line */}
              <div style={{
                position: 'absolute',
                top: 20,
                left: 0,
                right: 0,
                height: 2,
                background: 'var(--border)',
                zIndex: 0,
              }}>
                <div style={{
                  height: '100%',
                  background: 'var(--gradient)',
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>

              {/* Step Circles */}
              {steps.map((step, idx) => (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: currentStep >= step.id ? 'var(--gradient)' : 'var(--bg-surface)',
                    border: currentStep >= step.id ? 'none' : '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    transition: 'all 0.3s ease',
                  }}>
                    {currentStep > step.id ? (
                      <Check size={18} color="#fff" />
                    ) : (
                      <step.icon size={18} color={currentStep >= step.id ? '#fff' : 'var(--text-muted)'} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: currentStep === step.id ? 600 : 500,
                    color: currentStep === step.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            border: '1px solid var(--border)',
          }}>
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div style={{
                  animation: 'modalEnter 0.3s ease forwards',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => updateForm('name', e.target.value)}
                        placeholder="Enter full name"
                        required
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => updateForm('email', e.target.value)}
                        placeholder="Enter email address"
                        required
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Password
                      </label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={e => updateForm('password', e.target.value)}
                        placeholder="Enter password"
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Role
                      </label>
                      <select
                        value={form.role}
                        onChange={e => updateForm('role', e.target.value)}
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Work Details */}
              {currentStep === 2 && (
                <div style={{
                  animation: 'modalEnter 0.3s ease forwards',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Department *
                      </label>
                      <select
                        value={form.department_id}
                        onChange={e => updateForm('department_id', e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.department_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Designation *
                      </label>
                      <input
                        type="text"
                        value={form.designation}
                        onChange={e => updateForm('designation', e.target.value)}
                        placeholder="Enter designation"
                        required
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => updateForm('phone', e.target.value)}
                        placeholder="Enter phone number"
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Salary (₹) *
                      </label>
                      <input
                        type="number"
                        value={form.salary}
                        onChange={e => updateForm('salary', e.target.value)}
                        placeholder="Enter salary"
                        required
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{
                        display: 'block',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        marginBottom: 8,
                      }}>
                        Joining Date
                      </label>
                      <input
                        type="date"
                        value={form.joining_date}
                        onChange={e => updateForm('joining_date', e.target.value)}
                        style={{
                          width: '100%',
                          height: 44,
                          padding: '0 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Skills */}
              {currentStep === 3 && (
                <div style={{
                  animation: 'modalEnter 0.3s ease forwards',
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 12,
                  }}>
                    Select Skills
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                    {skills.map(s => {
                      const selected = selectedSkills.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSkillToggle(s.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 16px',
                            borderRadius: 20,
                            border: selected ? 'none' : '1px solid var(--border)',
                            background: selected ? 'var(--gradient)' : 'var(--bg-elevated)',
                            color: selected ? '#fff' : 'var(--text-secondary)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {selected && <Check size={14} />}
                          {s.skill_name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Image Upload */}
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 12,
                  }}>
                    Profile Images (max 5)
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: 32,
                    borderRadius: 'var(--radius-md)',
                    border: '2px dashed var(--border)',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <Upload size={20} />
                    Click to upload images
                    <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                  {previews.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
                      {previews.map((src, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            style={{
                              width: 72,
                              height: 72,
                              borderRadius: 12,
                              objectFit: 'cover',
                              border: '2px solid var(--border)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            style={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: 'var(--danger)',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => navigate('/employees')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: 12 }}>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: 'var(--gradient)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                      onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
                    >
                      Next
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: 'var(--gradient)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease',
                        opacity: loading ? 0.7 : 1,
                      }}
                      onMouseEnter={e => !loading && (e.target.style.filter = 'brightness(1.1)')}
                      onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
                    >
                      <Save size={16} />
                      {loading ? 'Creating...' : 'Create Employee'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CreateEmployee;
