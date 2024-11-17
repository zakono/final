const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Извлекаем токен после "Bearer"

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }
        req.user = user; // Добавляем пользователя в запрос для дальнейшей проверки
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admins Only' });
    }
    next();
};

exports.isEditor = (req, res, next) => {
    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Editors Only' });
    }
    next();
};

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); 

    if (!authHeader) {
        return res.status(401).json({ message: 'Access Denied: No Authorization Header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }
        req.user = user;
        next();
    });
};

