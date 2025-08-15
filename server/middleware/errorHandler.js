const errorHandler = (err, req, res, next) => {
    console.error("ERROR LOG:", new Date().toISOString());
    console.error("Route:", req.method, req.originalUrl);
    if (req.body && Object.keys(req.body).length > 0) console.error("Request Body:", req.body);
    console.error("Error Stack:", err.stack || err);

    let statusCode = err.statusCode || res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }
    
    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Invalid ID format for ${err.path}`;
    }


    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = { errorHandler };