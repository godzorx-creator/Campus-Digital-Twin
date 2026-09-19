/**
 * ============================================================
 *  CAMPUS MANAGEMENT BACKEND API — ALL-IN-ONE FILE
 *  Node.js + Express + PostgreSQL
 *  Run: node app.js
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
pool.on('error', (err) => { console.error('DB error', err); process.exit(-1); });
const db = { query: (text, params) => pool.query(text, params) };

// ─────────────────────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ─────────────────────────────────────────────────────────────
// VALIDATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

// ─────────────────────────────────────────────────────────────
// EXPRESS APP
// ─────────────────────────────────────────────────────────────
const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try { await db.query('SELECT 1'); dbStatus = 'connected'; } catch {}
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString(), database: dbStatus, environment: process.env.NODE_ENV || 'development' } });
});

// ─────────────────────────────────────────────────────────────
// BUILDINGS
// ─────────────────────────────────────────────────────────────
const buildingValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 20 }).isAlphanumeric().withMessage('Code must be alphanumeric'),
  body('address').optional().trim(),
  body('floors').optional().isInt({ min: 1 }).withMessage('Floors must be at least 1'),
  body('latitude').optional().isDecimal(),
  body('longitude').optional().isDecimal(),
  body('status').optional().isIn(['active', 'inactive', 'maintenance']),
];

app.get('/api/buildings', async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM buildings';
    const params = [];
    if (status) { params.push(status); query += ' WHERE status = $1'; }
    query += ' ORDER BY name';
    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
});

app.get('/api/buildings/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM buildings WHERE id = $1', [req.params.id]);
    if (!result.rows.length) throw new AppError('Building not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/api/buildings', validate(buildingValidation), async (req, res, next) => {
  try {
    const { name, code, address = null, floors = 1, latitude = null, longitude = null, description = null, status = 'active' } = req.body;
    const result = await db.query(
      'INSERT INTO buildings (name,code,address,floors,latitude,longitude,description,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, code, address, floors, latitude, longitude, description, status]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.put('/api/buildings/:id', validate(buildingValidation), async (req, res, next) => {
  try {
    const { name, code, address = null, floors = 1, latitude = null, longitude = null, description = null, status = 'active' } = req.body;
    const result = await db.query(
      'UPDATE buildings SET name=$1,code=$2,address=$3,floors=$4,latitude=$5,longitude=$6,description=$7,status=$8,updated_at=NOW() WHERE id=$9 RETURNING *',
      [name, code, address, floors, latitude, longitude, description, status, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Building not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.delete('/api/buildings/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM buildings WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) throw new AppError('Building not found', 404);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────────────────────────
const roomValidation = [
  body('building_id').notEmpty().withMessage('Building ID is required').isInt(),
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('room_number').trim().notEmpty().isLength({ max: 20 }),
  body('type').optional().isIn(['classroom', 'lab', 'office', 'conference', 'other']),
  body('floor').optional().isInt({ min: 0 }),
  body('capacity').optional().isInt({ min: 0 }),
  body('equipment').optional().isArray(),
  body('is_available').optional().isBoolean(),
  body('status').optional().isIn(['active', 'inactive', 'maintenance']),
];

const fmtEq = (eq) => (typeof eq === 'object' && eq !== null ? JSON.stringify(eq) : eq || '[]');

app.get('/api/rooms', async (req, res, next) => {
  try {
    const { building_id, type, floor, is_available } = req.query;
    let query = 'SELECT rooms.*, buildings.name AS building_name FROM rooms LEFT JOIN buildings ON rooms.building_id=buildings.id';
    const conditions = [], params = [];
    if (building_id) { params.push(building_id); conditions.push('rooms.building_id=$' + params.length); }
    if (type) { params.push(type); conditions.push('rooms.type=$' + params.length); }
    if (floor !== undefined && floor !== '') { params.push(floor); conditions.push('rooms.floor=$' + params.length); }
    if (is_available !== undefined && is_available !== '') { params.push(is_available === 'true'); conditions.push('rooms.is_available=$' + params.length); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY rooms.building_id, rooms.room_number';
    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
});

app.get('/api/rooms/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT rooms.*, buildings.name AS building_name FROM rooms LEFT JOIN buildings ON rooms.building_id=buildings.id WHERE rooms.id=$1',
      [req.params.id]
    );
    if (!result.rows.length) throw new AppError('Room not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/api/rooms', validate(roomValidation), async (req, res, next) => {
  try {
    const { building_id, name, room_number, type = 'other', floor = 1, capacity = 0, equipment, is_available = true, status = 'active' } = req.body;
    const result = await db.query(
      'INSERT INTO rooms (building_id,name,room_number,type,floor,capacity,equipment,is_available,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [building_id, name, room_number, type, floor, capacity, fmtEq(equipment), is_available, status]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.put('/api/rooms/:id', validate(roomValidation), async (req, res, next) => {
  try {
    const { building_id, name, room_number, type = 'other', floor = 1, capacity = 0, equipment, is_available = true, status = 'active' } = req.body;
    const result = await db.query(
      'UPDATE rooms SET building_id=$1,name=$2,room_number=$3,type=$4,floor=$5,capacity=$6,equipment=$7,is_available=$8,status=$9,updated_at=NOW() WHERE id=$10 RETURNING *',
      [building_id, name, room_number, type, floor, capacity, fmtEq(equipment), is_available, status, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Room not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.delete('/api/rooms/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM rooms WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) throw new AppError('Room not found', 404);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// PARKING
// ─────────────────────────────────────────────────────────────
const parkingValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('building_id').optional({ nullable: true }).isInt(),
  body('location').optional().trim(),
  body('total_spots').optional().isInt({ min: 0 }),
  body('available_spots').optional().isInt({ min: 0 }),
  body('type').optional().isIn(['student', 'staff', 'visitor', 'accessible']),
  body('status').optional().isIn(['active', 'inactive', 'maintenance']),
];

app.get('/api/parking', async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let query = 'SELECT p.*, b.name AS building_name FROM parking_lots p LEFT JOIN buildings b ON p.building_id=b.id';
    const conditions = [], params = [];
    if (type) { params.push(type); conditions.push('p.type=$' + params.length); }
    if (status) { params.push(status); conditions.push('p.status=$' + params.length); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY p.name';
    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
});

app.get('/api/parking/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT p.*, b.name AS building_name FROM parking_lots p LEFT JOIN buildings b ON p.building_id=b.id WHERE p.id=$1',
      [req.params.id]
    );
    if (!result.rows.length) throw new AppError('Parking lot not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/api/parking', validate(parkingValidation), async (req, res, next) => {
  try {
    const { building_id, name, location, total_spots, available_spots, type, status } = req.body;
    const spots = available_spots !== undefined ? available_spots : total_spots || 0;
    const result = await db.query(
      'INSERT INTO parking_lots (building_id,name,location,total_spots,available_spots,type,status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [building_id || null, name, location, total_spots || 0, spots, type || 'student', status || 'active']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.put('/api/parking/:id', validate(parkingValidation), async (req, res, next) => {
  try {
    const { building_id, name, location, total_spots, available_spots, type, status } = req.body;
    const result = await db.query(
      'UPDATE parking_lots SET building_id=$1,name=$2,location=$3,total_spots=$4,available_spots=$5,type=$6,status=$7,updated_at=NOW() WHERE id=$8 RETURNING *',
      [building_id || null, name, location, total_spots, available_spots, type, status, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Parking lot not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.patch('/api/parking/:id/availability',
  validate([body('available_spots').notEmpty().isInt({ min: 0 })]),
  async (req, res, next) => {
    try {
      const lot = await db.query('SELECT * FROM parking_lots WHERE id=$1', [req.params.id]);
      if (!lot.rows.length) throw new AppError('Parking lot not found', 404);
      if (req.body.available_spots > lot.rows[0].total_spots) throw new AppError('Available spots cannot exceed total spots', 400);
      const result = await db.query('UPDATE parking_lots SET available_spots=$1,updated_at=NOW() WHERE id=$2 RETURNING *', [req.body.available_spots, req.params.id]);
      res.json({ success: true, data: result.rows[0] });
    } catch (err) { next(err); }
  }
);

app.delete('/api/parking/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM parking_lots WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) throw new AppError('Parking lot not found', 404);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// SENSORS
// ─────────────────────────────────────────────────────────────
const sensorValidation = [
  body('building_id').notEmpty().isInt(),
  body('room_id').optional({ nullable: true }).isInt(),
  body('type').notEmpty().isIn(['temperature', 'humidity', 'occupancy', 'energy', 'air_quality']),
  body('value').optional().isDecimal(),
  body('unit').trim().notEmpty().isLength({ max: 20 }),
  body('status').optional().isIn(['active', 'inactive', 'maintenance']),
];

app.get('/api/sensors', async (req, res, next) => {
  try {
    const { building_id, room_id, type, status } = req.query;
    let query = 'SELECT s.*, b.name AS building_name, r.room_number FROM sensors s LEFT JOIN buildings b ON s.building_id=b.id LEFT JOIN rooms r ON s.room_id=r.id';
    const conditions = [], params = [];
    if (building_id) { params.push(building_id); conditions.push('s.building_id=$' + params.length); }
    if (room_id)     { params.push(room_id);     conditions.push('s.room_id=$' + params.length); }
    if (type)        { params.push(type);         conditions.push('s.type=$' + params.length); }
    if (status)      { params.push(status);       conditions.push('s.status=$' + params.length); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY s.building_id, s.type';
    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
});

app.get('/api/sensors/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT s.*, b.name AS building_name, r.room_number FROM sensors s LEFT JOIN buildings b ON s.building_id=b.id LEFT JOIN rooms r ON s.room_id=r.id WHERE s.id=$1',
      [req.params.id]
    );
    if (!result.rows.length) throw new AppError('Sensor not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/api/sensors', validate(sensorValidation), async (req, res, next) => {
  try {
    const { building_id, room_id, type, value, unit, status } = req.body;
    const result = await db.query(
      'INSERT INTO sensors (building_id,room_id,type,value,unit,last_reading_at,status) VALUES ($1,$2,$3,$4,$5,NOW(),$6) RETURNING *',
      [building_id, room_id || null, type, value || null, unit, status || 'active']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.put('/api/sensors/:id', validate(sensorValidation), async (req, res, next) => {
  try {
    const { building_id, room_id, type, value, unit, status } = req.body;
    const result = await db.query(
      'UPDATE sensors SET building_id=$1,room_id=$2,type=$3,value=$4,unit=$5,last_reading_at=NOW(),status=$6,updated_at=NOW() WHERE id=$7 RETURNING *',
      [building_id, room_id || null, type, value, unit, status, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Sensor not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.delete('/api/sensors/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM sensors WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) throw new AppError('Sensor not found', 404);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────
const eventValidation = [
  body('building_id').notEmpty().isInt(),
  body('room_id').optional({ nullable: true }).isInt(),
  body('title').trim().notEmpty().isLength({ max: 300 }),
  body('description').optional().trim(),
  body('organizer').optional().trim().isLength({ max: 200 }),
  body('start_time').notEmpty().isISO8601(),
  body('end_time').notEmpty().isISO8601().custom((v, { req }) => {
    if (new Date(v) <= new Date(req.body.start_time)) throw new Error('end_time must be after start_time');
    return true;
  }),
  body('status').optional().isIn(['scheduled', 'ongoing', 'completed', 'cancelled']),
];

app.get('/api/events', async (req, res, next) => {
  try {
    const { building_id, status, upcoming } = req.query;
    let query = 'SELECT events.*, buildings.name AS building_name, rooms.room_number FROM events LEFT JOIN buildings ON events.building_id=buildings.id LEFT JOIN rooms ON events.room_id=rooms.id';
    const conditions = [], params = [];
    if (building_id)       { params.push(building_id); conditions.push('events.building_id=$' + params.length); }
    if (status)            { params.push(status);      conditions.push('events.status=$' + params.length); }
    if (upcoming === 'true') conditions.push('events.start_time > NOW()');
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY events.start_time ASC';
    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
});

app.get('/api/events/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT events.*, buildings.name AS building_name, rooms.room_number FROM events LEFT JOIN buildings ON events.building_id=buildings.id LEFT JOIN rooms ON events.room_id=rooms.id WHERE events.id=$1',
      [req.params.id]
    );
    if (!result.rows.length) throw new AppError('Event not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/api/events', validate(eventValidation), async (req, res, next) => {
  try {
    const { building_id, room_id, title, description, organizer, start_time, end_time, status } = req.body;
    if (new Date(end_time) <= new Date(start_time)) throw new AppError('end_time must be after start_time', 400);
    const result = await db.query(
      'INSERT INTO events (building_id,room_id,title,description,organizer,start_time,end_time,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [building_id, room_id || null, title, description || null, organizer || null, start_time, end_time, status || 'scheduled']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.put('/api/events/:id', validate(eventValidation), async (req, res, next) => {
  try {
    const { building_id, room_id, title, description, organizer, start_time, end_time, status } = req.body;
    const result = await db.query(
      'UPDATE events SET building_id=$1,room_id=$2,title=$3,description=$4,organizer=$5,start_time=$6,end_time=$7,status=$8,updated_at=NOW() WHERE id=$9 RETURNING *',
      [building_id, room_id || null, title, description || null, organizer || null, start_time, end_time, status || 'scheduled', req.params.id]
    );
    if (!result.rows.length) throw new AppError('Event not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.delete('/api/events/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM events WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) throw new AppError('Event not found', 404);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// ISSUES
// ─────────────────────────────────────────────────────────────
const issueValidation = [
  body('building_id').notEmpty().isInt(),
  body('room_id').optional({ nullable: true }).isInt(),
  body('title').trim().notEmpty().isLength({ max: 300 }),
  body('description').optional().trim(),
  body('category').optional().trim().isLength({ max: 100 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  body('reported_by').optional().trim().isLength({ max: 200 }),
  body('assigned_to').optional().trim().isLength({ max: 200 }),
];

app.get('/api/issues', async (req, res, next) => {
  try {
    const { building_id, priority, status, category } = req.query;
    let query = 'SELECT issues.*, buildings.name AS building_name, rooms.room_number FROM issues LEFT JOIN buildings ON issues.building_id=buildings.id LEFT JOIN rooms ON issues.room_id=rooms.id';
    const conditions = [], params = [];
    if (building_id) { params.push(building_id); conditions.push('issues.building_id=$' + params.length); }
    if (priority)    { params.push(priority);    conditions.push('issues.priority=$' + params.length); }
    if (status)      { params.push(status);      conditions.push('issues.status=$' + params.length); }
    if (category)    { params.push(category);    conditions.push('issues.category=$' + params.length); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += " ORDER BY CASE issues.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, issues.created_at DESC";
    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) { next(err); }
});

app.get('/api/issues/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT issues.*, buildings.name AS building_name, rooms.room_number FROM issues LEFT JOIN buildings ON issues.building_id=buildings.id LEFT JOIN rooms ON issues.room_id=rooms.id WHERE issues.id=$1',
      [req.params.id]
    );
    if (!result.rows.length) throw new AppError('Issue not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.post('/api/issues', validate(issueValidation), async (req, res, next) => {
  try {
    const { building_id, room_id, title, description, category, priority, status, reported_by, assigned_to } = req.body;
    const result = await db.query(
      'INSERT INTO issues (building_id,room_id,title,description,category,priority,status,reported_by,assigned_to) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [building_id, room_id || null, title, description || null, category || null, priority || 'medium', status || 'open', reported_by || null, assigned_to || null]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.put('/api/issues/:id', validate(issueValidation), async (req, res, next) => {
  try {
    const { building_id, room_id, title, description, category, priority, status, reported_by, assigned_to } = req.body;
    const resolvedAt = status === 'resolved' ? ', resolved_at=NOW()' : '';
    const result = await db.query(
      'UPDATE issues SET building_id=$1,room_id=$2,title=$3,description=$4,category=$5,priority=$6,status=$7,reported_by=$8,assigned_to=$9,updated_at=NOW()' + resolvedAt + ' WHERE id=$10 RETURNING *',
      [building_id, room_id || null, title, description || null, category || null, priority || 'medium', status || 'open', reported_by || null, assigned_to || null, req.params.id]
    );
    if (!result.rows.length) throw new AppError('Issue not found', 404);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

app.patch('/api/issues/:id/status',
  validate([body('status').notEmpty().isIn(['open', 'in_progress', 'resolved', 'closed'])]),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const resolvedAt = status === 'resolved' ? ', resolved_at=NOW()' : '';
      const result = await db.query(
        'UPDATE issues SET status=$1,updated_at=NOW()' + resolvedAt + ' WHERE id=$2 RETURNING *',
        [status, req.params.id]
      );
      if (!result.rows.length) throw new AppError('Issue not found', 404);
      res.json({ success: true, data: result.rows[0] });
    } catch (err) { next(err); }
  }
);

app.delete('/api/issues/:id', async (req, res, next) => {
  try {
    const result = await db.query('DELETE FROM issues WHERE id=$1 RETURNING *', [req.params.id]);
    if (!result.rows.length) throw new AppError('Issue not found', 404);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────
// 404 + GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/buildings`);
  console.log(`   GET  /api/rooms`);
  console.log(`   GET  /api/parking`);
  console.log(`   GET  /api/sensors`);
  console.log(`   GET  /api/events`);
  console.log(`   GET  /api/issues`);
});

module.exports = app;
