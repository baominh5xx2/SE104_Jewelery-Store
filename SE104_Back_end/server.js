const { connect } = require('./src/config/database.js');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes');
const cors = require('cors');
const port = 3000;
const app = express();

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});

// Cấu hình giới hạn kích thước
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: ['http://localhost:3001'], // Frontend port
    credentials: true
  }));

// Cấu hình CORS với header lớn hơn
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
});

// Middleware xử lý JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Định tuyến
routes(app);

// Endpoint kiểm tra
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Kết nối database
connect();

// Khởi động server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});