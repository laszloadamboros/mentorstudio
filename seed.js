const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Tanár felhasználó
        const userRes = await db.query(
            `INSERT INTO users (full_name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (email) DO NOTHING 
             RETURNING id`,
            ['Minta Tanár', 'tanar@oktatas.hu', hashedPassword, 'teacher']
        );

        if (userRes.rows.length > 0) {
            const teacherId = userRes.rows[0].id;
            
            // Tanár profil
            await db.query(
                `INSERT INTO teacher_profile (user_id, phone, bio) 
                 VALUES ($1, $2, $3)`,
                [teacherId, '+36 30 123 4567', 'Több mint 10 éves oktatási tapasztalattal rendelkezem fizika, angol és matematika tárgyakból. Célom az élményalapú és eredményes tanulás.']
            );
            console.log('Kezdő tanár fiók sikeresen létrehozva: tanar@oktatas.hu / admin123');
        } else {
            console.log('A tanár fiók már létezik.');
        }
    } catch (err) {
        console.error('Hiba a feltöltés során:', err);
    } finally {
        process.exit();
    }
}

seed();