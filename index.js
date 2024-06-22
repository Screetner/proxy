const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();

// JWT middleware to verify the token
// const checkJwt = jwt({
//     // Dynamically provide a signing key
//     secret: jwksRsa.expressJwtSecret({
//         cache: true,
//         rateLimit: true,
//         jwksRequestsPerMinute: 5,
//         jwksUri: 'https://YOUR_AUTH0_DOMAIN/.well-known/jwks.json'
//     }),
//
//     // Validate the audience and the issuer
//     algorithms: ['RS256'],
//     getToken: req => {
//         if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//             return req.headers.authorization.split(' ')[1];
//         }
//         return null;
//     }
// });

// Apply the checkJwt middleware to all routes
// app.use(checkJwt);

// Proxy requests to the specified API and forward JWT token
app.use('/', createProxyMiddleware({
    target: 'http://your_tus_server',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api/v2/users/user' // ensure the path matches the API endpoint
    },
    onProxyReq: (proxyReq, req, res) => {
        if (req.user) {
            proxyReq.setHeader('Authorization', `Bearer ${req.user.token}`);
        }
    }
}));

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Invalid token');
    } else {
        next(err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
