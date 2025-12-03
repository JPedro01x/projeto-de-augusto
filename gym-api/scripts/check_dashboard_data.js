/* Temporary script to check dashboard data
 * Usage: node scripts/check_dashboard_data.js
 */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'gym_management'
    });

    console.log('Connected to DB');

    // Active students (users.status = 'active')
    const [students] = await conn.execute(`
      SELECT COUNT(*) AS cnt
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE u.status = 'active'
    `);

    // Monthly revenue (payments.payment_date >= start of month AND status='paid')
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startIso = startOfMonth.toISOString().slice(0,10);

    const [payments] = await conn.execute(`
      SELECT IFNULL(SUM(amount),0) AS total
      FROM payments
      WHERE payment_date >= ? AND status = 'paid'
    `, [startIso]);

    // Today's attendance (check_in >= start of today)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayIso = startOfToday.toISOString().slice(0,19).replace('T',' ');

    const [attendance] = await conn.execute(`
      SELECT COUNT(*) AS cnt
      FROM attendance
      WHERE check_in >= ?
    `, [todayIso]);

    // Active workouts count
    const [workouts] = await conn.execute(`
      SELECT COUNT(*) AS cnt FROM workouts WHERE status = 'active'
    `);

    console.log('--- Dashboard data ---');
    console.log('Active students:', students[0].cnt);
    console.log('Monthly revenue:', payments[0].total);
    console.log('Today attendance:', attendance[0].cnt);
    console.log('Active workouts:', workouts[0].cnt);

    await conn.end();
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
