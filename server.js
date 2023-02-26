const connectDB  = require('./config/db')

const express = require('express');
//Connection to DB
connectDB();
const app = new express();

app.get('/', (req, res) => res.send("Application is running"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
