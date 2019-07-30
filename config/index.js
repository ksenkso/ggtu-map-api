require('dotenv').config();

const Index = {};

Index.app = process.env.APP || 'dev';
Index.port = process.env.PORT || '3000';
Index.db = {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '3306',
    name: process.env.DB_NAME || 'name',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

Index.jwt = {
    encryption: process.env.JWT_ENCRYPTION || 'jwt_please_change',
    expiration: process.env.JWT_EXPIRATION || '1d',
};

// Application settings
// Map routes settings
Index.maps = {
    routes: {
        velocity: 5000/3600, //5 km/h
    }
};
module.exports = Index;
