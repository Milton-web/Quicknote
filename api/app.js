require('dotenv').config();
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

app.use(express.json());
app.use('/api/user', authRoutes);
app.use('/api/notes', noteRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servern körs på http://localhost:${PORT}`));