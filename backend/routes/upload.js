const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype === 'text/csv' || 
      file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /upload - Upload and process CSV file
router.post('/', authenticateToken, upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  const uploadId = await processCSVFile(req.file, req.user.id);
  
  if (uploadId) {
    res.status(201).json({
      message: 'CSV file uploaded and processed successfully',
      uploadId: uploadId,
      filename: req.file.originalname,
      size: req.file.size
    });
  } else {
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

// Function to process CSV file
async function processCSVFile(file, userId) {
  const filePath = file.path;
  const records = [];
  let uploadId = null;

  try {
    // Start transaction
    await transaction(async (client) => {
      // Insert upload record
      const uploadResult = await client.query(
        'INSERT INTO csv_uploads (user_id, filename, original_filename, file_size, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, file.filename, file.originalname, file.size, 'processing']
      );
      uploadId = uploadResult.rows[0].id;

      // Parse CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Validate and clean data
            const record = {
              upload_id: uploadId,
              name: row.name ? row.name.trim() : null,
              email: row.email ? row.email.trim().toLowerCase() : null,
              phone: row.phone ? row.phone.trim() : null,
              amount: row.amount ? parseFloat(row.amount) : null
            };
            
            // Only add record if it has at least name or email
            if (record.name || record.email) {
              records.push(record);
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (error) => {
            reject(error);
          });
      });

      // Insert all records
      if (records.length > 0) {
        const values = records.map((record, index) => {
          const baseIndex = index * 4;
          return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`;
        }).join(', ');

        const params = records.flatMap(record => [
          record.upload_id,
          record.name,
          record.email,
          record.phone,
          record.amount
        ]);

        await client.query(
          `INSERT INTO records (upload_id, name, email, phone, amount) VALUES ${values}`,
          params
        );
      }

      // Update upload status and record count
      await client.query(
        'UPDATE csv_uploads SET status = $1, record_count = $2 WHERE id = $3',
        ['completed', records.length, uploadId]
      );
    });

    // Clean up file
    fs.unlinkSync(filePath);
    
    return uploadId;

  } catch (error) {
    console.error('CSV processing error:', error);
    
    // Update upload status to failed
    if (uploadId) {
      try {
        await query(
          'UPDATE csv_uploads SET status = $1 WHERE id = $2',
          ['failed', uploadId]
        );
      } catch (updateError) {
        console.error('Failed to update upload status:', updateError);
      }
    }

    // Clean up file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return null;
  }
}

// GET /upload - Get user's upload history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let queryText, queryParams;

    if (req.user.role === 'admin') {
      // Admin can see all uploads
      queryText = `
        SELECT 
          cu.id,
          cu.original_filename,
          cu.file_size,
          cu.upload_date,
          cu.status,
          cu.record_count,
          u.name as user_name,
          u.email as user_email
        FROM csv_uploads cu
        JOIN users u ON cu.user_id = u.id
        ORDER BY cu.upload_date DESC
        LIMIT $1 OFFSET $2
      `;
      queryParams = [limit, offset];
    } else {
      // Regular users see only their uploads
      queryText = `
        SELECT 
          cu.id,
          cu.original_filename,
          cu.file_size,
          cu.upload_date,
          cu.status,
          cu.record_count
        FROM csv_uploads cu
        WHERE cu.user_id = $1
        ORDER BY cu.upload_date DESC
        LIMIT $2 OFFSET $3
      `;
      queryParams = [req.user.id, limit, offset];
    }

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery, countParams;
    if (req.user.role === 'admin') {
      countQuery = 'SELECT COUNT(*) FROM csv_uploads';
      countParams = [];
    } else {
      countQuery = 'SELECT COUNT(*) FROM csv_uploads WHERE user_id = $1';
      countParams = [req.user.id];
    }

    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      uploads: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ error: 'Failed to retrieve uploads' });
  }
});

// GET /upload/stats - Get upload statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    let whereClause = '';
    let queryParams = [];

    if (req.user.role !== 'admin') {
      whereClause = 'WHERE user_id = $1';
      queryParams.push(req.user.id);
    }

    // Get basic stats
    let statsQuery;
    if (whereClause) {
      statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM csv_uploads ${whereClause}) as total_uploads,
          (SELECT COUNT(DISTINCT user_id) FROM csv_uploads ${whereClause}) as total_users,
          (SELECT COUNT(*) FROM csv_uploads ${whereClause} AND status = 'completed') as completed_uploads,
          (SELECT COUNT(*) FROM csv_uploads ${whereClause} AND status = 'failed') as failed_uploads
      `;
    } else {
      statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM csv_uploads) as total_uploads,
          (SELECT COUNT(DISTINCT user_id) FROM csv_uploads) as total_users,
          (SELECT COUNT(*) FROM csv_uploads WHERE status = 'completed') as completed_uploads,
          (SELECT COUNT(*) FROM csv_uploads WHERE status = 'failed') as failed_uploads
      `;
    }

    const statsResult = await query(statsQuery, queryParams);
    const stats = statsResult.rows[0];

    // Get recent uploads
    let recentUploadsQuery;
    if (whereClause) {
      recentUploadsQuery = `
        SELECT 
          cu.id,
          cu.original_filename,
          cu.file_size,
          cu.status,
          cu.upload_date,
          cu.record_count,
          u.name as user_name
        FROM csv_uploads cu
        JOIN users u ON cu.user_id = u.id
        ${whereClause}
        ORDER BY cu.upload_date DESC
        LIMIT 5
      `;
    } else {
      recentUploadsQuery = `
        SELECT 
          cu.id,
          cu.original_filename,
          cu.file_size,
          cu.status,
          cu.upload_date,
          cu.record_count,
          u.name as user_name
        FROM csv_uploads cu
        JOIN users u ON cu.user_id = u.id
        ORDER BY cu.upload_date DESC
        LIMIT 5
      `;
    }


    const recentUploadsResult = await query(recentUploadsQuery, queryParams);

    res.json({
      success: true,
      data: {
        statistics: {
          total_uploads: parseInt(stats.total_uploads) || 0,
          total_users: parseInt(stats.total_users) || 0,
          completed_uploads: parseInt(stats.completed_uploads) || 0,
          failed_uploads: parseInt(stats.failed_uploads) || 0,
        },
        recent_uploads: recentUploadsResult.rows
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

module.exports = router;
