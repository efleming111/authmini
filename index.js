const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const db = require('./database/dbConfig.js');

const server = express();

server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send('Its Alive!');
});

// Creates user
server.post('/api/register', (req, res)=>{
  const user = req.body;
  user.password = bcrypt.hashSync(user.password);
  if(user.username && user.password){
    db('users')
    .insert(user)
    .then(id=>{
      res.status(201).json({id: id[0]})
    })
    .catch(err=>{
      res.status(500).json({error: 'Failed to add user'})
    })
  }
  else{
    res.status(500).json({errorMessage: 'Please include user name and password'})
  }
})

// Deletes entire database!!!!!
server.delete('/', (req, res)=>{
  db('users')
  .del()
  .then(ids=>{
    res.json({message: 'Delete successful'})
  })
  .catch(error=>{
    res.status(500).json({error: 'Delete failed'})
  })
})

// User signing in
server.post('/api/login', (req, res)=>{
  const user = req.body;
  db('users')
  .where('username', user.username)
  .then(users=>{
    if(users.length && bcrypt.compareSync(user.password, users[0].password)){
      res.json({info: 'Correct'})
    }
    else{
      res.status(404).json({errorMessage: 'Invalid username or password'})
    }
  })
  .catch(err=>{
    res.status(500).json({error: 'Failed to find user'})
  })
})

// protect this route, only authenticated users should see it
server.get('/api/users', (req, res) => {
  db('users')
    .select('id', 'username')
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log('\nrunning on port 3300\n'));
