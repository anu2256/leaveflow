const express = require('express');
const healthRouter = require('./routes/health');
const leaveRequestsRouter = require('./routes/leaveRequests');
const balancesRouter = require('./routes/balances');
const authRouter = require('./routes/auth');
const teamRouter = require('./routes/team');
const { httpLogger } = require('./middleware/logging');

const app = express();

app.use(httpLogger);
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/leave-requests', leaveRequestsRouter);
app.use('/api/balances', balancesRouter);
app.use('/api/auth', authRouter);
app.use('/api/team', teamRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL',
      message: err.message
    }
  });
});
module.exports = app;

