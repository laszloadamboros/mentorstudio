const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Azonosítás szükséges (hiányzó token).' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Érvénytelen vagy lejárt token.' });
        }
        req.user = user;
        next();
    });
};

const requireTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Hozzáférés megtagadva. Csak tanár végezheti el ezt a műveletet.' });
    }
    next();
};

module.exports = { authenticateToken, requireTeacher };