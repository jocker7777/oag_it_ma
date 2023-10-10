const express = require("express");
const mysql = require("mysql2");
const app = express();
const port =  5500;

// Middleware to parse JSON requests
app.use(express.json());

// Create a MySQL database connection
const db = mysql.createConnection({
  host: "172.16.10.151",
  user: "eticket",
  password: "p@ssw0rd",
  database: "eticket",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Define your API routes here
app.get("/", (req, res) => {
  res.send("Welcome to your REST API!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Get all todos
app.get("/user", (req, res) => {
  //console.log(`Server is running on port ${port}`);
  db.query("SELECT * FROM oag_inventory", (err, results) => {
    if (err) {
      console.error("Error fetching todos:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.json(results);
  });
});

// Create a new todo
// app.post('/todos', (req, res) => {
//   const { title, completed } = req.body;
//   db.query('INSERT INTO todos (title, completed) VALUES (?, ?)', [title, completed], (err, result) => {
//     if (err) {
//       console.error('Error creating todo:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     res.status(201).json({ id: result.insertId, title, completed });
//   });
// });

// Update a todo by ID
// app.put('/todos/:id', (req, res) => {
//   const { id } = req.params;
//   const { title, completed } = req.body;
//   db.query('UPDATE todos SET title=?, completed=? WHERE id=?', [title, completed, id], (err) => {
//     if (err) {
//       console.error('Error updating todo:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     res.status(200).json({ id, title, completed });
//   });
// });

// Delete a todo by ID
// app.delete('/todos/:id', (req, res) => {
//   const { id } = req.params;
//   db.query('DELETE FROM todos WHERE id=?', [id], (err) => {
//     if (err) {
//       console.error('Error deleting todo:', err);
//       res.status(500).json({ error: 'Internal Server Error' });
//       return;
//     }
//     res.status(204).send();
//   });
// });
