const express = require('express');
const router = express.Router();

const theDB = require('./userDb');
const postDB = require('../posts/postDb');

router.post('/', validateUser, (req, res) => {
  theDB.insert(req.body)
    .then( user => res.status(201).json(user) )
    .catch( err => res.status(400).json({ error: 'Username is already taken' }) )
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  const postContent = req.body;
  postContent.user_id = req.user.id;
  postDB.insert(postContent)
    .then( post => {
      res.status(201).json(post);
    })
    .catch( err => {
      res.status(500).json({ error: 'There was an error while trying to add post to database' })
    })
});

router.get('/', (req, res) => {
  theDB.get()
    .then( userList => {
      if(userList.length > 0) {
        res.status(200).json(userList);
      } else {
        res.status(400).json({ message: 'There are no users in the database' });
      }
    })
    .catch( err => {
      res.status(500).json({ error: 'There was an error trying to get users from the database' })
    } );
});

router.get('/:id', validateUserId, (req, res) => {
    res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  theDB.getUserPosts(req.user.id)
    .then( posts => {
      if(posts.length > 0) {
        res.status(200).json(posts);
      } else {
        res.status(400).json({ message: 'The user has no posts' });
      }
    })
    .catch( err => {
      res.status(500).json({ error: 'There was an error while trying to get user’s posts'})
    });
});

router.delete('/:id', validateUserId, (req, res) => {
  theDB.remove(req.user.id)
    .then( deleted => {
      if (deleted) {
        res.status(410);
      } else {
        res.status(404).status({ error: 'Problem deleting user' })
      }
    })
    .catch( err => {
      res.status(500).json({ error: 'Something went wrong while trying to delete the user' })
    })
});

router.put('/:id', validateUserId, validateUser, (req, res) => {
  theDB.update(req.params.id, req.body)
    .then( updated => {
      if (updated) {
        res.status(201).json({ message: 'user successfully updated'})
      } else {
        res.status(400).json({ error: 'There was an error while trying to update user'})
      }
    })
    .catch( err => res.status(400).json({ error: 'Username is already taken' }) )
});

//custom middleware

function validateUserId(req, res, next) {
  const {id} = req.params;
  
  theDB.getById(id)
    .then( user => {
      if(user) {
        req.user = user;
        next();
      } else {
        res.status(404).json({ message: 'A user with that ID does not exist' });
      }
    })
    .catch( err => {
      res.status(500).json({ error: `There was an error trying to retrieve the user with ID ${id}`});
    })
};

function validateUser(req, res, next) {
  let username = req.body;

  if( !username ) {
    res.status(400).json({ message: 'Missing user data' })
  } else if( !username.name.trim() ) {
    res.json(400).json({ message: 'missing required text field' });
  }
  next();
};

 function validatePost(req, res, next) {
  if(Object.entries(req.body).length === 0) {
    res.status(400).json({ message: "Missing post data" })
  } else if ( !req.body.text || !req.body.text.trim() ) {
    res.status(400).json({ message: 'Missing required text field' })
  } else {
    next();
  }
};

module.exports = router;
module.exports = validatePost;