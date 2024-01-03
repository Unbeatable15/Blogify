//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const pool = require('./db.js');
const ejs = require("ejs");
const session = require('express-session');
const bcrypt = require('bcryptjs');;
var _ = require('lodash');

const homeStartingContent = "Hello guys, My name is Ajinkya Kshatriya, I am from Pune, I have created this blogging website for fun.You can go to the Compose section and add title and text which you want to post and click on publish button. In about section there is information about me and in contact section there is contact detail about me(which are fake So don't try to contact me).Post whatever you want!!✌️";
const aboutContent = "My Name is Ajinkya Kshatriya. I have created this website for fun if there is anything you want to tell be about this website there is no need to tell as this is just small website with no particular major funcionality it is just for bloging and You can download and edit any file you want to edit as per your choice and you can deploy it. Keep Coding👨‍💻";
const contactContent = "Ajinkya Kshatriya";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(express.json());
app.use(session({
  secret: 'mysessionajinkya1510', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
}));


function setVariables(req) {
  const isLoggedIn = req.session.user ? true : false;
  const username = isLoggedIn ? (req.session.user.name.includes(' ') ? req.session.user.name.split(' ')[0].toUpperCase() : req.session.user.name.toUpperCase()) : '';
  return {
    isLoggedIn,
    username
  };
}

app.get("/", async (req, res) => {
  try {
    const {
      isLoggedIn,
      username
    } = setVariables(req);

    // Fetch posts from the database
    const client = await pool.connect();
    const query = 'SELECT * FROM blog_posts'; // Adjust this query based on your table structure
    const result = await client.query(query);
    const posts = result.rows; // Assuming the retrieved rows are your posts
    client.release();

    res.render('home', {
      homeContent: homeStartingContent,
      posts: posts, // Send the posts to the frontend
      isLoggedIn: isLoggedIn,
      username: username
    });
  } catch (error) {
    res.status(500).json({
      catchError: error
    });
  }
});

app.get("/about", (req, res) => {
  const {
    isLoggedIn,
    username
  } = setVariables(req);
  res.render('about', {
    aboutStart: aboutContent,
    isLoggedIn: isLoggedIn,
    username: username
  });
})

app.get("/contact", (req, res) => {
  const {
    isLoggedIn,
    username
  } = setVariables(req);
  res.render('contact', {
    contactStart: contactContent,
    isLoggedIn: isLoggedIn,
    username: username
  });
})

app.get("/compose", (req, res) => {
  const {
    isLoggedIn,
    username
  } = setVariables(req);
  res.render('compose', {
    isLoggedIn: isLoggedIn,
    username: username
  });
})

app.post("/compose", async (req, res) => {
  const {
    postTitle,
    postBody
  } = req.body;
  const username = req.session.user ? req.session.user.name : 'Anonymous';

  try {
    const client = await pool.connect();
    const query = 'INSERT INTO blog_posts (title, content, author) VALUES ($1, $2, $3)';
    const values = [postTitle, postBody, username];

    await client.query(query, values);
    client.release();

    res.redirect("/");
  } catch (error) {
    console.error('Error creating the post:', error);
    res.status(500).send('Error while creating the post');
  }
});


app.get("/post/:id", async (req, res) => {
  const {
    isLoggedIn,
    username
  } = setVariables(req);
  const postId = req.params.id;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM blog_posts WHERE id = $1';
    const result = await client.query(query, [postId]);
    client.release();

    if (result.rows.length === 0) {
      res.status(404).send('Post not found');
      return;
    }

    const post = result.rows[0];
    res.render('post', {
      title: post.title,
      content: post.content,
      posts: post,
      isLoggedIn,
      username
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching post');
  }
});

app.get('/signup', (req, res) => {
  const {
    isLoggedIn,
    username
  } = setVariables(req);
  res.render('signup', {
    isLoggedIn: isLoggedIn,
    username: username
  });
});

app.post('/signup', async (req, res) => {
  const {
    name,
    email,
    password
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const client = await pool.connect();
    const query = 'INSERT INTO blog_user (name, email, password) VALUES ($1, $2, $3)';
    const values = [name, email, hashedPassword]; // Store the hashed password

    await client.query(query, values);
    client.release();
    res.status(201).send('User added successfully');
  } catch (error) {
    res.status(500).json({
      catchError: error
    });
  }
});

app.get('/login', (req, res) => {
  const {
    isLoggedIn,
    username
  } = setVariables(req);
  res.render('login', {
    isLoggedIn: isLoggedIn,
    username: username
  });
});


app.post('/login', async (req, res) => {
  const {
    email,
    password
  } = req.body;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM blog_user WHERE email = $1';
    const result = await client.query(query, [email]);
    client.release();

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      req.session.user = user;
      res.redirect('/?username=' + encodeURIComponent(user.name));
    } else {
      res.status(401).json('Invalid username or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Login failed');
  }
});

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect('/');
})

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});