import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Perform a simple query to check if the database is accessible
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'success',
      message: 'Database connection is successful.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);

    let errorMessage = 'Database connection failed.';
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Invalid database credentials.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Database connection timed out.';
    }

    res.status(500).json({
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}