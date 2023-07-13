module.exports = {
    secret: "KetNR-secret-key",
    REFRESH_TOKEN_SECRET: "Time-To-Make-CHANGE",
    // jwtExpiration: 3600,           // 1 hour
    // jwtRefreshExpiration: 86400,   // 24 hours
    /* for test */
    // jwtExpiration: 60,          // 1 minute
    // jwtRefreshExpiration: 120,  // 2 minutes

    jwtExpiration: 86400,          // 1 day
    jwtRefreshExpiration: 604800,  // 7 days
    jwtApiKeyExpiration: '9999 years' // 9999 years
  };