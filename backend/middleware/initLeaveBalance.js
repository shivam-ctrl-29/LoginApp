const pool = require('../config/db');

const initLeaveBalance = async (userId) => {
  try {
    const leaveTypes = await pool.query('SELECT * FROM leave_types');
    for (const lt of leaveTypes.rows) {
      await pool.query(
        'INSERT INTO leave_balance (employee_id, leave_type_id, available_days) VALUES ($1, $2, $3)',
        [userId, lt.id, lt.total_days]
      );
    }
    console.log(`Leave balance initialized for user ${userId}`);
  } catch (err) {
    console.error('Leave balance init error:', err.message);
  }
};

module.exports = initLeaveBalance;