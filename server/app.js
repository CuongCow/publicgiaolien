// Cấu hình routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/superadmin', require('./routes/superadmin')); 