const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'registration'
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/course', (req, res) => {
  pool.query('SELECT * FROM trn_course_detail', (error, results) => {
    if (error) {
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

app.get('/course/detail/:id', (req, res) => {
  const courseId = req.params.id;
  pool.query('SELECT * FROM trn_course_detail WHERE train_course_id = ?', [courseId], (error, results) => {
    if (error) {
      console.error('Error fetching course details:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Course not found');
      return;
    }
    res.json(results[0]);
  });
});

app.post('/course', (req, res) => {
  const { course_detail_name, course_id, train_detail, train_place, start_date, finish_date } = req.body;
  pool.query(
    'INSERT INTO trn_course_detail (course_detail_name, course_id, train_detail, train_place, start_date, finish_date) VALUES (?, ?, ?, ?, ?, ?)',
    [course_detail_name, course_id, train_detail, train_place, start_date, finish_date],
    (error, results) => {
      if (error) {
        console.error('Error inserting course:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
      res.status(201).json({ message: 'Course created successfully' });
    }
  );
});



app.put('/course/update/:id', (req, res) => {
  const courseId = req.params.id;
  const { course_detail_name, train_detail, train_place, start_date, finish_date } = req.body;
  pool.query(
    'UPDATE trn_course_detail SET course_detail_name = ?, train_detail = ?, train_place = ?, start_date = ?, finish_date = ? WHERE train_course_id = ?',
    [course_detail_name, train_detail, train_place, start_date, finish_date, courseId],
    (error, results) => {
      if (error) {
        console.error('Error updating course:', error);
        res.status(500).send('Internal Server Error');
        return;
      }
      if (results.affectedRows === 0) {
        res.status(404).send('Course not found');
        return;
      }
      res.status(200).send('Course updated successfully');
    }
  );
});

// DELETE route for deleting a course by ID
app.delete('/course/:id', (req, res) => {
  const courseId = req.params.id;
  pool.query('DELETE FROM trn_course_detail WHERE train_course_id = ?', [courseId], (error, results) => {
    if (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  });
});

const PORT = process.env.PORT || 11230;
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
