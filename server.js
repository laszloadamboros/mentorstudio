require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cron = require('node-cron');
const { Resend } = require('resend');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mentorstudio_super_secret_key_123';

// Resend e-mail kliens inicializálása
const resend = new Resend(process.env.RESEND_API_KEY || 're_Vbrk8CUh_6dwjQFyo3V9ZqwqJV7ycmoUD');

// Middleware-ek
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Feltöltések mappa konfigurálása
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Adatbázis kapcsolat
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/magantanar_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Óradíj kiszámítása - Javítva: Ha meg van adva egyedi érték, az jelenik meg!
const calculateLessonPrice = (startTime, endTime, rate50, rate100, isAdmin) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMinutes = Math.round((end - start) / (1000 * 60));

  let r50 = rate50 !== null && rate50 !== undefined ? Number(rate50) : (isAdmin ? 7000 : 5000);
  let r100 = rate100 !== null && rate100 !== undefined ? Number(rate100) : (isAdmin ? 12000 : 9000);

  return diffMinutes <= 60 ? r50 : r100;
};

// Admin jutalék (Kornya cut) számítása órahossz alapján (50 perc <= 60: 1500 Ft, 100 perc > 60: 2000 Ft)
const calculateAdminCut = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMinutes = Math.round((end - start) / (1000 * 60));
  return diffMinutes <= 60 ? 1500 : 2000;
};

// Adatbázis sémák automatikus frissítése
const initDb = async () => {
  try {
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS hourly_rate_50 INT DEFAULT 5000,
      ADD COLUMN IF NOT EXISTS hourly_rate_100 INT DEFAULT 9000,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS school VARCHAR(255),
      ADD COLUMN IF NOT EXISTS class_name VARCHAR(50);

      ALTER TABLE lessons 
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid',
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS topic TEXT,
      ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS file_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

      CREATE TABLE IF NOT EXISTS landing_page (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) DEFAULT 'Kornya Mentorstúdió',
        subtitle TEXT DEFAULT 'Személyre szabott oktatás és tehetséggondozás',
        about_text TEXT DEFAULT 'Stúdiónk célja, hogy segítse a diákokat a tanulási nehézségek leküzdésében és a kiemelkedő teljesítmény elérésében.',
        activities TEXT DEFAULT 'Egyéni korrepetálás, Érettségi felkészítés, Versenyfelkészítés, Nyelvoktatás',
        phone VARCHAR(50) DEFAULT '+36 30 123 4567',
        email VARCHAR(100) DEFAULT 'info@mentorstudio.hu',
        address VARCHAR(255) DEFAULT 'Budapest, Fő utca 1.',
        team_image_url VARCHAR(500),
        logo_url VARCHAR(500)
      );
    `);

    const landingCheck = await db.query('SELECT id FROM landing_page LIMIT 1');
    if (landingCheck.rows.length === 0) {
      await db.query(`
        INSERT INTO landing_page (title, subtitle, about_text, activities, phone, email, address) 
        VALUES (
          'Kornya Mentorstúdió', 
          'Személyre szabott oktatás és tehetséggondozás', 
          'Stúdiónk célja, hogy segítse a diákokat a tanulási nehézségek leküzdésében és a kiemelkedő eredmények elérésében.', 
          'Egyéni korrepetálás, Érettségi felkészítés, Versenyfelkészítés, Nyelvoktatás', 
          '+36 30 123 4567', 
          'info@mentorstudio.hu', 
          'Budapest, Fő utca 1.'
        )
      `);
    }

    console.log('Adatbázis séma ellenőrizve és frissítve.');
  } catch (err) {
    console.error('Hiba az adatbázis séma frissítésekor:', err);
  }
};
initDb();

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token szükséges' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Érvénytelen token' });
    req.user = user;
    next();
  });
};

const getAdminEmails = async () => {
  try {
    const adminRes = await db.query("SELECT email FROM users WHERE is_admin = true OR id = 1");
    return adminRes.rows.map(row => row.email).filter(Boolean);
  } catch (e) {
    console.error("Hiba az admin e-mailek lekérésekor:", e);
    return [];
  }
};

const sendWeeklyUnpaidReport = async () => {
  try {
    console.log('Heti fizetési és jutalék jelentés összeállítás...');

    const reportRes = await db.query(`
      SELECT 
        l.id AS lesson_id,
        l.start_time,
        l.subject,
        s.full_name AS student_name,
        s.email AS student_email,
        t.full_name AS teacher_name
      FROM lessons l
      LEFT JOIN users s ON l.student_id = s.id
      LEFT JOIN users t ON l.teacher_id = t.id
      WHERE (l.is_paid = false OR COALESCE(l.payment_status, 'unpaid') = 'unpaid')
        AND l.start_time >= date_trunc('week', CURRENT_DATE)
        AND l.start_time < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
      ORDER BY l.start_time DESC
    `);

    const lessonsForCommission = await db.query(`
      SELECT 
        t.id AS teacher_id,
        t.full_name AS teacher_name,
        t.is_admin,
        t.hourly_rate_50,
        t.hourly_rate_100,
        l.start_time,
        l.end_time,
        l.payment_status
      FROM lessons l
      JOIN users t ON l.teacher_id = t.id
      WHERE l.start_time >= date_trunc('week', CURRENT_DATE)
        AND l.start_time < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
    `);

    const allWeeklyLessonsRes = await db.query(`
      SELECT 
        t.id AS teacher_id,
        t.full_name AS teacher_name,
        l.start_time,
        l.end_time
      FROM lessons l
      JOIN users t ON l.teacher_id = t.id
      WHERE l.start_time >= date_trunc('week', CURRENT_DATE)
        AND l.start_time < date_trunc('week', CURRENT_DATE) + INTERVAL '1 week'
    `);

    const teacherCommissions = {};

    lessonsForCommission.rows.forEach(row => {
      const tId = row.teacher_id;
      const isAdmin = Boolean(row.is_admin) || tId === 1;

      if (!teacherCommissions[tId]) {
        teacherCommissions[tId] = {
          teacher_name: row.teacher_name,
          is_admin: isAdmin,
          lesson_count: 0,
          total_commission: 0
        };
      }
      
      let rate = 0;
      if (row.payment_status !== 'settled') {
        rate = calculateLessonPrice(row.start_time, row.end_time, row.hourly_rate_50, row.hourly_rate_100, isAdmin);
      }
      
      teacherCommissions[tId].lesson_count += 1;
      teacherCommissions[tId].total_commission += rate;
    });

    const teacherStats = {};
    let studioTotalRevenue = 0;

    allWeeklyLessonsRes.rows.forEach(row => {
      const tId = row.teacher_id;
      if (!teacherStats[tId]) {
        teacherStats[tId] = {
          teacher_name: row.teacher_name,
          lesson_count: 0
        };
      }
      teacherStats[tId].lesson_count += 1;
    });

    const teacherCommissionRows = Object.values(teacherCommissions);
    const teacherStatRows = Object.values(teacherStats);

    studioTotalRevenue = teacherCommissionRows.reduce((sum, item) => sum + item.total_commission, 0);

    const adminEmails = await getAdminEmails();

    if (adminEmails.length > 0 && (reportRes.rows.length > 0 || teacherCommissionRows.length > 0 || teacherStatRows.length > 0)) {
      let unpaidTableHtml = '<p>Minden diák rendezte a fizetést erre a hétre!</p>';
      if (reportRes.rows.length > 0) {
        const adminTableRows = reportRes.rows
          .map(row => {
            const dateStr = new Date(row.start_time).toLocaleString('hu-HU', {
              dateStyle: 'short',
              timeStyle: 'short'
            });
            return `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${dateStr}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.student_name || 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.teacher_name || 'N/A'}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.subject || 'Nincs megadva'}</td>
              </tr>
            `;
          })
          .join('');

        unpaidTableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Időpont</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Diák</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tanár</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tantárgy</th>
              </tr>
            </thead>
            <tbody>
              ${adminTableRows}
            </tbody>
          </table>
        `;
      }

      let commissionTableHtml = '<p>Nem volt megtartott óra a héten.</p>';
      if (teacherCommissionRows.length > 0) {
        let grandTotal = 0;
        const commissionRows = teacherCommissionRows
          .map(row => {
            grandTotal += row.total_commission;
            const roleLabel = row.is_admin ? ' (Admin)' : '';
            return `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${row.teacher_name}${roleLabel}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${row.lesson_count} db</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${Number(row.total_commission).toLocaleString('hu-HU')} Ft</td>
              </tr>
            `;
          })
          .join('');

        commissionTableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tanár neve</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Megtartott órák</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Beszedendő / Elszámolt összegek</th>
              </tr>
            </thead>
            <tbody>
              ${commissionRows}
              <tr style="background-color: #e6f7ff;">
                <td colspan="2" style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">ÖSSZESEN:</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; color: #0050b3;">${grandTotal.toLocaleString('hu-HU')} Ft</td>
              </tr>
            </tbody>
          </table>
        `;
      }

      let statsTableHtml = '<p>Nem volt megtartott óra ezen a héten.</p>';
      if (teacherStatRows.length > 0) {
        const statsRows = teacherStatRows
          .map(row => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${row.teacher_name}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${row.lesson_count} óra</td>
            </tr>
          `)
          .join('');

        statsTableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tanár neve</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Megtartott órák száma</th>
              </tr>
            </thead>
            <tbody>
              ${statsRows}
              <tr style="background-color: #f6ffed;">
                <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">MENTORSTÚDIÓ HETI ÖSSZFORGALMA:</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #389e0d; font-size: 1.1em;">${studioTotalRevenue.toLocaleString('hu-HU')} Ft</td>
              </tr>
            </tbody>
          </table>
        `;
      }

      await resend.emails.send({
        from: 'MentorStúdió Rendszer <onboarding@resend.dev>',
        to: adminEmails,
        subject: '📊 Heti fizetési, jutalék és forgalmi kimutatás (Admin)',
        html: `
          <h2>Heti Összefoglaló Jelentés</h2>
          <h3>1. Tanári Jutalékok és Elszámolások</h3>
          ${commissionTableHtml}
          <br><hr><br>
          <h3>2. Kifizetetlen Diák Órák</h3>
          ${unpaidTableHtml}
          <br><hr><br>
          <h3>3. Tanári Óraszámok és Mentorstúdió Összforgalom</h3>
          ${statsTableHtml}
        `
      });
      console.log('Heti jelentés e-mailben elküldve.');
    }
  } catch (err) {
    console.error('Hiba a heti jelentés küldésekor:', err);
  }
};

cron.schedule('0 20 * * 0', () => {
  sendWeeklyUnpaidReport();
});

// API ENDPOINT-OK

app.get('/api/landing', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM landing_page ORDER BY id ASC LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Hiba a kezdőlap adatok lekérésekor' });
  }
});

app.put('/api/landing', authenticateToken, upload.fields([
  { name: 'team_image', maxCount: 1 },
  { name: 'logo_image', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.user.is_admin && req.user.id !== 1) {
      return res.status(403).json({ error: 'Csak admin módosíthatja a kezdőlapot' });
    }

    const { title, subtitle, about_text, activities, phone, email, address } = req.body;
    let team_image_url = null;
    let logo_url = null;

    if (req.files && req.files['team_image']) {
      team_image_url = `/uploads/${req.files['team_image'][0].filename}`;
    }
    if (req.files && req.files['logo_image']) {
      logo_url = `/uploads/${req.files['logo_image'][0].filename}`;
    }

    const currentRes = await db.query('SELECT team_image_url, logo_url FROM landing_page LIMIT 1');
    const current = currentRes.rows[0] || {};

    const finalTeamImg = team_image_url || current.team_image_url;
    const finalLogoImg = logo_url || current.logo_url;

    const result = await db.query(`
      UPDATE landing_page 
      SET title = $1, subtitle = $2, about_text = $3, activities = $4, phone = $5, email = $6, address = $7, team_image_url = $8, logo_url = $9
      WHERE id = (SELECT id FROM landing_page LIMIT 1)
      RETURNING *
    `, [title, subtitle, about_text, activities, phone, email, address, finalTeamImg, finalLogoImg]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Hibás e-mail vagy jelszó' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Hibás e-mail vagy jelszó' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_admin: user.is_admin,
        phone: user.phone,
        bio: user.bio,
        subject: user.subject,
        hourly_rate_50: user.hourly_rate_50,
        hourly_rate_100: user.hourly_rate_100,
        school: user.school,
        class_name: user.class_name
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Szerver hiba a bejelentkezés során' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Nem található felhasználó ezzel az e-mail címmel' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await db.query(`
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2 
      WHERE email = $3
    `, [resetToken, resetExpires, email]);

    const resetLink = `https://mentorstudio-7ngc.vercel.app/?token=${resetToken}`;

    await resend.emails.send({
      from: 'MentorStúdió <onboarding@resend.dev>',
      to: [email],
      subject: '🔑 Jelszó visszaállítási kérelem',
      html: `
        <h3>Kedves Felhasználó!</h3>
        <p>Jelszó visszaállítási kérelmet kaptunk a fiókodhoz. Az alábbi gombra kattintva megadhatod az új jelszavadat:</p>
        <p><a href="${resetLink}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Új jelszó megadása</a></p>
        <p>A link 1 órán keresztül érvényes.</p>
      `
    });

    res.json({ message: 'Visszaállító link elküldve a megadott e-mail címre!' });
  } catch (err) {
    console.error('Elfelejtett jelszó hiba:', err);
    res.status(500).json({ error: 'Hiba a jelszóvisszaállítási folyamatban' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const userRes = await db.query(`
      SELECT * FROM users 
      WHERE reset_password_token = $1 AND reset_password_expires > NOW()
    `, [token]);

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'Érvénytelen vagy lejárt jelszóvisszaállító token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(`
      UPDATE users 
      SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL 
      WHERE id = $2
    `, [hashedPassword, userRes.rows[0].id]);

    res.json({ message: 'A jelszavad sikeresen megváltoztatva! Most már bejelentkezhetsz az új jelszavaddal.' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba a jelszó frissítésekor' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT id, full_name, email, role, is_admin, phone, bio, subject, hourly_rate_50, hourly_rate_100, school, class_name FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a profil lekérésekor' });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { full_name, email, phone, bio, subject, hourly_rate_50, hourly_rate_100, password, school, class_name } = req.body;
  try {
    let r50 = hourly_rate_50 !== undefined && hourly_rate_50 !== '' ? parseInt(hourly_rate_50) : 5000;
    let r100 = hourly_rate_100 !== undefined && hourly_rate_100 !== '' ? parseInt(hourly_rate_100) : 9000;

    let query = 'UPDATE users SET full_name = $1, email = $2, phone = $3, bio = $4, subject = $5, hourly_rate_50 = $6, hourly_rate_100 = $7, school = $8, class_name = $9';
    let params = [full_name, email, phone, bio, subject, r50, r100, school || '', class_name || ''];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password_hash = $10 WHERE id = $11 RETURNING id, full_name, email, role, is_admin, phone, bio, subject, hourly_rate_50, hourly_rate_100, school, class_name';
      params.push(hashedPassword, req.user.id);
    } else {
      query += ' WHERE id = $10 RETURNING id, full_name, email, role, is_admin, phone, bio, subject, hourly_rate_50, hourly_rate_100, school, class_name';
      params.push(req.user.id);
    }

    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a profil frissítésekor' });
  }
});

app.get('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, u.full_name AS teacher_name 
      FROM announcements a
      LEFT JOIN users u ON a.teacher_id = u.id
      ORDER BY a.is_pinned DESC, a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a hírek lekérésekor' });
  }
});

app.post('/api/announcements', authenticateToken, async (req, res) => {
  const { title, content, is_pinned, is_applyable } = req.body;
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Hírt csak tanár hozhat létre' });

    const result = await db.query(`
      INSERT INTO announcements (teacher_id, title, content, is_pinned, is_applyable)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, title, content, is_pinned || false, is_applyable || false]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a hír létrehozásakor' });
  }
});

app.delete('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Nincs jogosultságod' });
    await db.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ message: 'Hír törölve' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba a hír törlésekor' });
  }
});

app.get('/api/about-us', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM about_us ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a bemutatkozók lekérésekor' });
  }
});

app.post('/api/about-us', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Nincs jogosultságod' });
    const { name, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await db.query(`
      INSERT INTO about_us (name, description, image_url, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, imageUrl, req.user.id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a bemutatkozó létrehozásakor' });
  }
});

app.delete('/api/about-us/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Nincs jogosultságod' });
    await db.query('DELETE FROM about_us WHERE id = $1', [req.params.id]);
    res.json({ message: 'Névjegy törölve' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba a törléskor' });
  }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
  const { announcement_id, teacher_id } = req.body;
  try {
    const annRes = await db.query('SELECT title FROM announcements WHERE id = $1', [announcement_id]);
    const annTitle = annRes.rows[0]?.title || 'Óra hirdetés';

    await db.query(`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
    `, [req.user.id, teacher_id, `Szia! Jelentkeztem a(z) "${annTitle}" órára.`]);

    res.json({ message: 'Sikeres jelentkezés!' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba a jelentkezéskor' });
  }
});

// Órarend lekérése diákoknak és tanároknak egyaránt
app.get('/api/schedule', authenticateToken, async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'teacher') {
      const { teacher_id } = req.query;
      let targetTeacherId = req.user.id;

      if ((req.user.is_admin || req.user.id === 1) && teacher_id) {
        targetTeacherId = teacher_id;
      }

      query = `
        SELECT l.*, s.full_name AS student_name, s.email AS student_email,
               t.full_name AS teacher_name, t.hourly_rate_50, t.hourly_rate_100, t.is_admin
        FROM lessons l
        LEFT JOIN users s ON l.student_id = s.id
        LEFT JOIN users t ON l.teacher_id = t.id
      `;

      if (!(req.user.is_admin || req.user.id === 1) || teacher_id) {
        query += ` WHERE l.teacher_id = $1`;
        params.push(targetTeacherId);
      }
      query += ` ORDER BY l.start_time ASC`;

    } else {
      query = `
        SELECT l.*, t.full_name AS teacher_name, t.email AS teacher_email, t.phone AS teacher_phone
        FROM lessons l
        LEFT JOIN users t ON l.teacher_id = t.id
        WHERE l.student_id = $1
        ORDER BY l.start_time ASC
      `;
      params.push(req.user.id);
    }

    const result = await db.query(query, params);
    
    const lessons = result.rows.map(l => ({
      ...l,
      calculated_price: calculateLessonPrice(l.start_time, l.end_time, l.hourly_rate_50, l.hourly_rate_100, l.is_admin)
    }));

    res.json(lessons);
  } catch (err) {
    console.error('Hiba az órarend lekérésekor:', err);
    res.status(500).json({ error: 'Hiba az órarend adatok lekérésekor' });
  }
});

app.get('/api/teachers', authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT id, full_name, email, phone, bio, subject, hourly_rate_50, hourly_rate_100, is_admin FROM users WHERE role = 'teacher' ORDER BY full_name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a tanárok lekérésekor' });
  }
});

app.get('/api/schedule/teachers', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin && req.user.id !== 1) {
      return res.status(403).json({ error: 'Nincs jogosultságod' });
    }
    const result = await db.query("SELECT id, full_name, email FROM users WHERE role = 'teacher' ORDER BY full_name ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a szűrő tanárok lekérésekor' });
  }
});

app.get('/api/student/today-lesson', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, t.full_name AS teacher_name, t.email AS teacher_email, t.phone AS teacher_phone
      FROM lessons l
      LEFT JOIN users t ON l.teacher_id = t.id
      WHERE l.student_id = $1 AND l.start_time::date = CURRENT_DATE 
      ORDER BY l.start_time ASC LIMIT 1
    `, [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a mai óra lekérésekor' });
  }
});

app.get('/api/student/lessons', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, t.full_name AS teacher_name, t.email AS teacher_email, t.phone AS teacher_phone
      FROM lessons l
      LEFT JOIN users t ON l.teacher_id = t.id
      WHERE l.student_id = $1 AND l.start_time >= NOW() 
      ORDER BY l.start_time ASC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba az órák lekérésekor' });
  }
});

app.get('/api/student/past-lessons', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.*, t.full_name AS teacher_name, t.email AS teacher_email, t.phone AS teacher_phone
      FROM lessons l
      LEFT JOIN users t ON l.teacher_id = t.id
      WHERE l.student_id = $1 AND l.start_time < NOW() 
      ORDER BY l.start_time DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a korábbi órák lekérésekor' });
  }
});

app.get('/api/student/teacher-info', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT u.full_name, u.email, u.phone, u.bio
      FROM users u
      JOIN lessons l ON u.id = l.teacher_id
      WHERE l.student_id = $1
      LIMIT 1
    `, [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a tanár infó lekérésekor' });
  }
});

app.get('/api/teacher/all-lessons', authenticateToken, async (req, res) => {
  try {
    const { teacher_id } = req.query;
    let targetTeacherId = req.user.id;

    if ((req.user.is_admin || req.user.id === 1) && teacher_id) {
      targetTeacherId = teacher_id;
    }

    let query = `
      SELECT l.*, s.full_name AS student_name, s.email AS student_email,
             t.full_name AS teacher_name, t.hourly_rate_50, t.hourly_rate_100, t.is_admin
      FROM lessons l
      LEFT JOIN users s ON l.student_id = s.id
      LEFT JOIN users t ON l.teacher_id = t.id
    `;
    let params = [];

    if (!(req.user.is_admin || req.user.id === 1) || teacher_id) {
      query += ` WHERE l.teacher_id = $1`;
      params.push(targetTeacherId);
    }

    query += ` ORDER BY l.start_time DESC`;

    const result = await db.query(query, params);
    const lessonsWithCalculations = result.rows.map(l => ({
      ...l,
      calculated_price: calculateLessonPrice(l.start_time, l.end_time, l.hourly_rate_50, l.hourly_rate_100, l.is_admin)
    }));
    res.json(lessonsWithCalculations);
  } catch (err) {
    res.status(500).json({ error: 'Hiba az órák lekérésekor' });
  }
});

app.get('/api/teacher/earnings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Nincs jogosultságod' });
    }

    const { period, month, week } = req.query;
    let startDate, endDate;

    if (period === 'week' && week) {
      const parts = week.split('-W');
      const year = parseInt(parts[0]);
      const weekNum = parseInt(parts[1]);

      const simple = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      else
        ISOweekStart.setDate(simple.getDate() + (8 - simple.getDay()));

      startDate = new Date(ISOweekStart);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else {
      const selectedMonth = month || new Date().toISOString().slice(0, 7);
      startDate = new Date(`${selectedMonth}-01T00:00:00`);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    }

    const lessonsRes = await db.query(`
      SELECT l.*, t.hourly_rate_50, t.hourly_rate_100, t.is_admin, s.full_name AS student_name
      FROM lessons l
      JOIN users t ON l.teacher_id = t.id
      LEFT JOIN users s ON l.student_id = s.id
      WHERE l.teacher_id = $1 AND l.start_time >= $2 AND l.start_time < $3
      ORDER BY l.start_time DESC
    `, [req.user.id, startDate, endDate]);

    let totalGrossEarnings = 0;
    let totalCutPayable = 0;

    const lessonsCalculated = lessonsRes.rows.map(l => {
      const grossPrice = calculateLessonPrice(l.start_time, l.end_time, l.hourly_rate_50, l.hourly_rate_100, l.is_admin);
      const adminCut = req.user.is_admin ? 0 : calculateAdminCut(l.start_time, l.end_time);
      const netEarnings = grossPrice - adminCut;

      totalGrossEarnings += grossPrice;
      totalCutPayable += adminCut;

      return {
        ...l,
        gross_price: grossPrice,
        admin_cut: adminCut,
        net_price: netEarnings
      };
    });

    const netEarnings = totalGrossEarnings - totalCutPayable;

    res.json({
      is_admin: req.user.is_admin,
      period: period || 'month',
      lessons: lessonsCalculated,
      total_lessons: lessonsCalculated.length,
      total_gross: totalGrossEarnings,
      total_cut: totalCutPayable,
      net_earnings: netEarnings,
      payee_email: 'kornya.kms@gmail.com'
    });
  } catch (err) {
    console.error('Hiba a kereset számításakor:', err);
    res.status(500).json({ error: 'Hiba a kereset kiszámításakor' });
  }
});

app.get('/api/teacher/students', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.id, s.full_name, s.email, s.phone, s.notes, s.school, s.class_name, COUNT(l.id) AS total_lessons
      FROM users s
      LEFT JOIN lessons l ON s.id = l.student_id
      WHERE s.role = 'student'
      GROUP BY s.id, s.full_name, s.email, s.phone, s.notes, s.school, s.class_name
      ORDER BY s.full_name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a diákok lekérésekor' });
  }
});

app.post('/api/teacher/students', authenticateToken, async (req, res) => {
  const { full_name, email, password, phone, notes, school, class_name } = req.body;
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Nincs jogosultságod' });
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone, notes, school, class_name)
      VALUES ($1, $2, $3, 'student', $4, $5, $6, $7)
      RETURNING id, full_name, email, phone, notes, school, class_name
    `, [full_name, email, hashedPassword, phone || '', notes || '', school || '', class_name || '']);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a diák létrehozásakor (lehet létezik már az e-mail)' });
  }
});

// Diák szerkesztése API ENDPOINT (iskola és osztály támogatásával)
app.put('/api/teacher/students/:id', authenticateToken, async (req, res) => {
  const { full_name, email, phone, notes, school, class_name, password } = req.body;
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Nincs jogosultságod' });
    }

    let query = `UPDATE users SET full_name = $1, email = $2, phone = $3, notes = $4, school = $5, class_name = $6`;
    let params = [full_name, email, phone || '', notes || '', school || '', class_name || ''];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password_hash = $7 WHERE id = $8 AND role = 'student' RETURNING id, full_name, email, phone, notes, school, class_name`;
      params.push(hashedPassword, req.params.id);
    } else {
      query += ` WHERE id = $7 AND role = 'student' RETURNING id, full_name, email, phone, notes, school, class_name`;
      params.push(req.params.id);
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diák nem található' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a diák adatainak frissítésekor: ' + err.message });
  }
});

app.delete('/api/teacher/students/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Nincs jogosultságod' });
    await db.query("DELETE FROM users WHERE id = $1 AND role = 'student'", [req.params.id]);
    res.json({ message: 'Diák törölve' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba a diák törlésekor' });
  }
});

app.post('/api/teacher/teachers', authenticateToken, async (req, res) => {
  const { full_name, email, password, phone, bio, subject, is_admin, hourly_rate_50, hourly_rate_100 } = req.body;
  try {
    if (!req.user.is_admin && req.user.id !== 1) {
      return res.status(403).json({ error: 'Csak adminisztrátor hozhat létre új tanárt!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let r50 = hourly_rate_50 !== undefined && hourly_rate_50 !== '' ? parseInt(hourly_rate_50) : 5000;
    let r100 = hourly_rate_100 !== undefined && hourly_rate_100 !== '' ? parseInt(hourly_rate_100) : 9000;

    const result = await db.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone, bio, subject, is_admin, hourly_rate_50, hourly_rate_100)
      VALUES ($1, $2, $3, 'teacher', $4, $5, $6, $7, $8, $9)
      RETURNING id, full_name, email, phone, bio, subject, is_admin, hourly_rate_50, hourly_rate_100
    `, [full_name, email, hashedPassword, phone || '', bio || '', subject || 'Matematika', is_admin || false, r50, r100]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a tanár létrehozásakor (lehet létezik már az e-mail)' });
  }
});

// Tanár szerkesztése API ENDPOINT
app.put('/api/teacher/teachers/:id', authenticateToken, async (req, res) => {
  const { full_name, email, phone, bio, subject, hourly_rate_50, hourly_rate_100, is_admin, password } = req.body;
  try {
    if (!req.user.is_admin && req.user.id !== 1) {
      return res.status(403).json({ error: 'Csak admin szerkesztheti a tanárok adatait!' });
    }

    let r50 = hourly_rate_50 !== undefined && hourly_rate_50 !== '' ? parseInt(hourly_rate_50) : 5000;
    let r100 = hourly_rate_100 !== undefined && hourly_rate_100 !== '' ? parseInt(hourly_rate_100) : 9000;

    let query = `
      UPDATE users 
      SET full_name = $1, email = $2, phone = $3, bio = $4, subject = $5, hourly_rate_50 = $6, hourly_rate_100 = $7, is_admin = $8
    `;
    let params = [full_name, email, phone || '', bio || '', subject || '', r50, r100, is_admin || false];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password_hash = $9 WHERE id = $10 AND role = 'teacher' RETURNING id, full_name, email, phone, bio, subject, hourly_rate_50, hourly_rate_100, is_admin`;
      params.push(hashedPassword, req.params.id);
    } else {
      query += ` WHERE id = $9 AND role = 'teacher' RETURNING id, full_name, email, phone, bio, subject, hourly_rate_50, hourly_rate_100, is_admin`;
      params.push(req.params.id);
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tanár nem található' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a tanár adatainak frissítésekor: ' + err.message });
  }
});

app.delete('/api/teacher/teachers/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin && req.user.id !== 1) {
      return res.status(403).json({ error: 'Csak admin törölhet tanárt!' });
    }
    await db.query("DELETE FROM users WHERE id = $1 AND role = 'teacher'", [req.params.id]);
    res.json({ message: 'Tanár törölve' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba a tanár törlésekor' });
  }
});

// Óra létrehozása + Ismétlődő tanóra támogatása + e-mail értesítés Resend segítségével
app.post('/api/teacher/lessons', authenticateToken, async (req, res) => {
  const { student_id, subject, start_time, end_time, topic, notes, is_recurring } = req.body;
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Nincs jogosultságod' });

    let lessonsToInsert = [];
    const baseStart = new Date(start_time);
    const baseEnd = new Date(end_time);

    if (is_recurring) {
      const targetYear = baseStart.getFullYear();
      let currentStart = new Date(baseStart);
      let currentEnd = new Date(baseEnd);

      while (currentStart.getFullYear() === targetYear) {
        lessonsToInsert.push({
          start: new Date(currentStart).toISOString(),
          end: new Date(currentEnd).toISOString()
        });

        currentStart.setDate(currentStart.getDate() + 7);
        currentEnd.setDate(currentEnd.getDate() + 7);
      }
    } else {
      lessonsToInsert.push({
        start: baseStart.toISOString(),
        end: baseEnd.toISOString()
      });
    }

    const insertedLessons = [];
    for (const item of lessonsToInsert) {
      const result = await db.query(`
        INSERT INTO lessons (teacher_id, student_id, subject, start_time, end_time, topic, notes, payment_status, is_paid, is_recurring)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'unpaid', false, $8)
        RETURNING *
      `, [req.user.id, student_id, subject, item.start, item.end, topic || '', notes || '', Boolean(is_recurring)]);

      insertedLessons.push(result.rows[0]);
    }

    const firstLesson = insertedLessons[0];

    try {
      const studentRes = await db.query('SELECT email, full_name FROM users WHERE id = $1', [student_id]);
      const teacherRes = await db.query('SELECT email, full_name FROM users WHERE id = $1', [req.user.id]);
      const adminEmails = await getAdminEmails();

      const student = studentRes.rows[0];
      const teacher = teacherRes.rows[0];

      const recipients = Array.from(new Set([
        student?.email,
        teacher?.email,
        ...adminEmails
      ])).filter(Boolean);

      if (recipients.length > 0) {
        const formattedStart = new Date(start_time).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' });
        const formattedEnd = new Date(end_time).toLocaleTimeString('hu-HU', { timeStyle: 'short' });

        const recurringNote = is_recurring 
          ? `<p style="color: #10b981;"><strong>🔄 Ez egy ismétlődő tanóra, amely az év végéig minden héten ezen az időponton automatikusan be lett ütemezve!</strong></p>` 
          : '';

        await resend.emails.send({
          from: 'MentorStúdió Rendszer <onboarding@resend.dev>',
          to: recipients,
          subject: `📅 Új óra rögzítve: ${subject}${is_recurring ? ' (Ismétlődő)' : ''}`,
          html: `
            <h2>Új óra került rögzítésre a MentorStúdióban!</h2>
            ${recurringNote}
            <p><strong>Oktató:</strong> ${teacher ? teacher.full_name : 'Ismeretlen'}</p>
            <p><strong>Diák:</strong> ${student ? student.full_name : 'Ismeretlen'}</p>
            <p><strong>Tantárgy:</strong> ${subject}</p>
            <p><strong>Kezdő Időpont:</strong> ${formattedStart} - ${formattedEnd}</p>
            <p><strong>Témakör:</strong> ${topic || 'Nincs megadva'}</p>
            <p><strong>Megjegyzés:</strong> ${notes || 'Nincs'}</p>
          `
        });
        console.log('Óra értesítő e-mail sikeresen kiküldve!');
      }
    } catch (emailErr) {
      console.error('Hiba az órafelvételi e-mail küldésekor:', emailErr);
    }

    res.json(firstLesson);
  } catch (err) {
    console.error('Hiba az óra létrehozásakor:', err);
    res.status(500).json({ error: 'Hiba az óra létrehozásakor' });
  }
});

// Óra frissítése
app.put('/api/teacher/lessons/:id', authenticateToken, async (req, res) => {
  const { topic, notes, custom_price } = req.body;
  try {
    const result = await db.query(`
      UPDATE lessons 
      SET topic = $1, notes = $2
      WHERE id = $3
      RETURNING *
    `, [topic || '', notes || '', req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Óra nem található' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba az óra módosításakor' });
  }
});

app.delete('/api/teacher/lessons/:id', authenticateToken, async (req, res) => {
  try {
    const lessonRes = await db.query(`
      SELECT l.*, s.email AS student_email, s.full_name AS student_name, t.full_name AS teacher_name
      FROM lessons l
      LEFT JOIN users s ON l.student_id = s.id
      LEFT JOIN users t ON l.teacher_id = t.id
      WHERE l.id = $1
    `, [req.params.id]);

    if (lessonRes.rows.length === 0) return res.status(404).json({ error: 'Óra nem található' });
    const lesson = lessonRes.rows[0];

    await db.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);

    if (lesson.student_email) {
      const dateStr = new Date(lesson.start_time).toLocaleString('hu-HU', { dateStyle: 'short', timeStyle: 'short' });
      resend.emails.send({
        from: 'MentorStúdió Rendszer <onboarding@resend.dev>',
        to: [lesson.student_email],
        subject: '❌ Óra lemondás értesítő',
        html: `
          <h3>Kedves ${lesson.student_name}!</h3>
          <p>Tájékoztatunk, hogy a következő órád lemondásra kerül:</p>
          <p><strong>Időpont:</strong> ${dateStr}</p>
          <p><strong>Tantárgy:</strong> ${lesson.subject}</p>
          <p><strong>Oktató:</strong> ${lesson.teacher_name}</p>
        `
      }).catch(err => console.error('E-mail küldési hiba:', err));
    }

    res.json({ message: 'Óra törölve és értesítés elküldve.' });
  } catch (err) {
    res.status(500).json({ error: 'Hiba az óra törlésekor' });
  }
});

app.patch('/api/teacher/lessons/:id/paid', authenticateToken, async (req, res) => {
  const { payment_status, is_paid } = req.body;
  try {
    const status = payment_status || (is_paid ? 'cash' : 'unpaid');
    const paidBool = status !== 'unpaid';

    const result = await db.query(`
      UPDATE lessons 
      SET payment_status = $1, is_paid = $2 
      WHERE id = $3
      RETURNING *
    `, [status, paidBool, req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a fizetési státusz módosításakor' });
  }
});

// BESZÉLGETÉSEK LEKÉRÉSE: Korlátozva, hogy a diákok kizárólag TANÁR vagy ADMIN felhasználókkal cseveghessenek!
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    let query = '';
    let params = [req.user.id];

    if (req.user.role === 'student') {
      // Diák esetén csak a tanárokat és az adminokat kérjük le
      query = `
        SELECT DISTINCT u.id, u.full_name, u.email, u.role
        FROM users u
        WHERE u.id != $1 AND (u.role = 'teacher' OR u.is_admin = true OR u.id = 1)
        ORDER BY u.full_name ASC
      `;
    } else {
      // Tanárok és adminok az összes többi felhasználóval cseveghetnek
      query = `
        SELECT DISTINCT u.id, u.full_name, u.email, u.role
        FROM users u
        WHERE u.id != $1
        ORDER BY u.full_name ASC
      `;
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba a beszélgetések lekérésekor' });
  }
});

app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  const targetId = req.params.userId;
  try {
    const result = await db.query(`
      SELECT * FROM messages 
      WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `, [req.user.id, targetId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Hiba az üzenetek lekérésekor' });
  }
});

// ÜZENET KÜLDÉSE: Backend védelem diákoknak
app.post('/api/messages', authenticateToken, upload.single('file'), async (req, res) => {
  const { receiver_id, content } = req.body;
  try {
    // Ha a küldő diák, ellenőrizzük, hogy a címzett tanár-e vagy admin-e
    if (req.user.role === 'student') {
      const receiverRes = await db.query('SELECT role, is_admin, id FROM users WHERE id = $1', [receiver_id]);
      if (receiverRes.rows.length === 0) {
        return res.status(404).json({ error: 'A megadott címzett nem található' });
      }

      const receiver = receiverRes.rows[0];
      const isTeacherOrAdmin = receiver.role === 'teacher' || receiver.is_admin === true || receiver.id === 1;

      if (!isTeacherOrAdmin) {
        return res.status(403).json({ error: 'Diákok csak tanárokkal vagy adminisztrátorokkal cseveghetnek!' });
      }
    }

    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const file_name = req.file ? req.file.originalname : null;

    const result = await db.query(`
      INSERT INTO messages (sender_id, receiver_id, content, file_url, file_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, receiver_id, content || '', file_url, file_name]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Hiba az üzenet küldésekor' });
  }
});

app.get('/api/admin/log', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_admin && req.user.id !== 1) {
      return res.status(403).json({ error: 'Csak adminisztrátor tekintheti meg a naplót!' });
    }

    const { period_type, month, week, teacher_id } = req.query;

    let startDate;
    let endDate;

    if (period_type === 'week' && week) {
      const parts = week.split('-W');
      const year = parseInt(parts[0]);
      const weekNum = parseInt(parts[1]);
      
      const simple = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      else
        ISOweekStart.setDate(simple.getDate() + (8 - simple.getDay()));
      
      startDate = new Date(ISOweekStart);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
    } else {
      const selectedMonth = month || new Date().toISOString().slice(0, 7);
      startDate = new Date(`${selectedMonth}-01T00:00:00`);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    }

    const allLessonsRes = await db.query(`
      SELECT
        l.id,
        l.teacher_id,
        l.student_id,
        l.start_time,
        l.end_time,
        l.subject,
        l.topic,
        l.notes,
        l.payment_status,
        l.is_paid,
        l.is_recurring,
        t.full_name AS teacher_name,
        t.hourly_rate_50,
        t.hourly_rate_100,
        t.is_admin,
        s.full_name AS student_name,
        s.email AS student_email
      FROM lessons l
      LEFT JOIN users t ON l.teacher_id = t.id
      LEFT JOIN users s ON l.student_id = s.id
      ${teacher_id ? 'WHERE l.teacher_id = $1' : ''}
      ORDER BY l.start_time DESC
    `, teacher_id ? [teacher_id] : []);

    const allLessons = allLessonsRes.rows.map(l => ({
      ...l,
      calculated_price: calculateLessonPrice(l.start_time, l.end_time, l.hourly_rate_50, l.hourly_rate_100, l.is_admin),
      admin_cut: Boolean(l.is_admin) ? 0 : calculateAdminCut(l.start_time, l.end_time),
      in_period: new Date(l.start_time) >= startDate && new Date(l.start_time) < endDate
    }));

    const lessonsWithPrices = allLessons.filter(l => l.in_period);

    let period_revenue = 0, cumulative_revenue = 0;
    let period_cash = 0, period_transfer = 0, period_settled = 0;
    let total_cash = 0, total_transfer = 0, total_unpaid = 0;

    let admin_own_revenue = 0;
    let admin_commission_from_non_admins = 0;

    const teacherMap = {};
    const studentMap = {};

    allLessons.forEach(l => {
      const price = l.calculated_price;
      const isAdminTeacher = Boolean(l.is_admin) || l.teacher_id === 1;
      const cut = isAdminTeacher ? 0 : l.admin_cut;

      const isCash = l.payment_status === 'cash';
      const isTransfer = l.payment_status === 'transfer';
      const isSettled = l.payment_status === 'settled';
      const isPaid = l.is_paid || isCash || isTransfer;
      const isUnpaid = !isPaid && !isSettled;

      if (l.in_period) {
        if (isAdminTeacher) {
          admin_own_revenue += price;
        } else {
          admin_commission_from_non_admins += cut;
        }
      }

      if (l.teacher_id) {
        if (!teacherMap[l.teacher_id]) {
          teacherMap[l.teacher_id] = {
            teacher_name: l.teacher_name,
            is_admin: isAdminTeacher,
            hourly_rate_50: l.hourly_rate_50,
            hourly_rate_100: l.hourly_rate_100,
            period_lessons: 0,
            total_lessons: 0,
            period_revenue: 0,
            period_commission: 0
          };
        }
        teacherMap[l.teacher_id].total_lessons += 1;
        if (l.in_period) {
          teacherMap[l.teacher_id].period_lessons += 1;
          teacherMap[l.teacher_id].period_revenue += price;
          teacherMap[l.teacher_id].period_commission += cut;
        }
      }

      if (l.student_id) {
        if (!studentMap[l.student_id]) {
          studentMap[l.student_id] = {
            student_name: l.student_name,
            student_email: l.student_email,
            period_lessons: 0,
            period_paid: 0,
            total_lessons: 0,
            total_paid: 0
          };
        }
        studentMap[l.student_id].total_lessons += 1;
        if (l.in_period) studentMap[l.student_id].period_lessons += 1;

        if (!isSettled && isPaid) {
          studentMap[l.student_id].total_paid += price;
          if (l.in_period) studentMap[l.student_id].period_paid += price;
        }
      }

      if (isCash) {
        total_cash += price;
        if (l.in_period) period_cash += price;
      } else if (isTransfer) {
        total_transfer += price;
        if (l.in_period) period_transfer += price;
      } else if (isUnpaid) {
        total_unpaid += price;
      }
      if (isSettled && l.in_period) {
        period_settled += price;
      }

      if (!isSettled && isPaid) {
        cumulative_revenue += price;
        if (l.in_period) period_revenue += price;
      }
    });

    const total_admin_earnings = admin_own_revenue + admin_commission_from_non_admins;
    const teachers_stats = Object.values(teacherMap).sort((a, b) => b.period_lessons - a.period_lessons);
    const students_stats = Object.values(studentMap).sort((a, b) => b.period_lessons - a.period_lessons);

    res.json({
      lessons: lessonsWithPrices,
      total_lessons: lessonsWithPrices.length,
      period_revenue,
      cumulative_revenue,
      period_cash,
      period_transfer,
      period_settled,
      total_cash,
      total_transfer,
      total_unpaid,
      admin_own_revenue,
      admin_commission_from_non_admins,
      total_admin_earnings,
      teachers_stats,
      students_stats
    });

  } catch (err) {
    console.error('Napló lekérdezési hiba:', err);
    res.status(500).json({ error: 'Hiba az ügyviteli napló adatok lekérésekor' });
  }
});

// Dummy endpointok a frontend hibamentes logolásához
app.post('/api/report-feature-flag', (req, res) => {
  res.status(200).json({ success: true });
});

app.all('/api/logs/request-log', (req, res) => {
  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Szerver fut a http://localhost:${PORT} porton`);
});

sendWeeklyUnpaidReport();