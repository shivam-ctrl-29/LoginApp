import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarPlus } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import DataTable from '../components/ui/DataTable';
import Badge, { statusVariant } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import useAuth from '../hooks/useAuth';

function MyLeaves() {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const { getToken, API_URL } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // eslint-disable-line
    fetchLeaves();
  }, []); // eslint-disable-line

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/leave/my`, {
        headers: { Authorization: token },
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const columns = [
    { key: 'leave_name', label: 'Leave Type' },
    {
      key: 'from_date',
      label: 'From',
      render: (row) => formatDate(row.from_date),
    },
    {
      key: 'to_date',
      label: 'To',
      render: (row) => formatDate(row.to_date),
    },
    {
      key: 'total_days',
      label: 'Days',
      render: (row) => <span style={{ fontWeight: 700 }}>{row.total_days}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => (
        <span style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.reason}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge>,
    },
  ];

  const statuses = [...new Set(leaves.map(l => l.status).filter(Boolean))];

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="My Leaves" subtitle="Track your leave applications" />
        <TableSkeleton rows={5} cols={6} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Leaves"
        subtitle={`${leaves.length} leave application${leaves.length !== 1 ? 's' : ''} on record`}
        actions={
          <Button variant="primary" icon={CalendarPlus} onClick={() => navigate('/leave/apply')}>
            Apply Leave
          </Button>
        }
      />

      {leaves.length === 0 ? (
        <GlassCard style={{ padding: 60, textAlign: 'center' }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `${theme.colors.accent}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CalendarPlus size={28} color={theme.colors.accent} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: theme.colors.text, fontSize: 18 }}>No leave applications yet</h3>
          <p style={{ margin: '0 0 24px', color: theme.colors.textSecondary, fontSize: 14 }}>
            Submit your first leave request to get started
          </p>
          <Button variant="primary" icon={CalendarPlus} onClick={() => navigate('/leave/apply')}>
            Apply for Leave
          </Button>
        </GlassCard>
      ) : (
        <DataTable
          columns={columns}
          data={leaves}
          searchKeys={['leave_name', 'reason', 'status']}
          filterKey="status"
          filterOptions={statuses}
          emptyMessage="No matching leave records"
        />
      )}
    </AppLayout>
  );
}

export default MyLeaves;
