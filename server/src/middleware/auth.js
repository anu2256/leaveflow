const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('missing bearer token');
    error.status = 401;
    error.code = 'NO_TOKEN';
    return next(error);
  }

  const token = authHeader.slice(7);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const error = new Error('invalid or expired token');
    error.status = 401;
    error.code = 'BAD_TOKEN';
    return next(error);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error('forbidden');
      error.status = 403;
      error.code = 'FORBIDDEN';
      return next(error);
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};