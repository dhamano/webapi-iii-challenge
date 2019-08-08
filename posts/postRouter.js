const express = require('express');

const router = express.Router();

const postDB = require('../posts/postDb');

const validatePost = require('../users/userRouter');

router.get('/', (req, res) => {
 postDB.get()
  .then( postList => {
    res.status(200).json(postList);
  })
  .catch( err => {
    res.status(500).json({ error: 'There was an error getting the posts from the database' });
  })
});

router.get('/:id', validatePostId, (req, res) => {
  res.status(200).json(req.post);
});

router.delete('/:id', validatePostId, (req, res) => {
  postDB.remove(req.post.id)
    .then( deleted => {
      if( deleted ) {
        res.status(410);
      } else {
        res.status(400).json({ error: 'There was an error while trying to delete your post' })
      }
    })
    .catch( err => {
      res.status(500).json({ error: 'There was an error trying to delete the post from the database' })
    })
});

router.put('/:id', validatePostId, validatePost, (req, res) => {
  req.body.user_id = req.post.user_id;
  
  postDB.update(req.post.id, req.body)
    .then( updated => {
      if(updated) {
        res.status(200).json({ message: 'The post has been updated' });
      } else {
        res.status(400).json({ error: 'There was a problem updating the post' });
      }
    })
    .catch( err => {
      res.status(500).json({ error: 'Something went wrong trying to update your post' })
    })
});

// custom middleware

function validatePostId(req, res, next) {
  const {id} = req.params;
  
  postDB.getById(id)
    .then( post => {
      if(post) {
        req.post = post;
        next();
      } else {
        res.status(404).json({ message: 'A post with that ID does not exist' });
      }
    })
    .catch( err => {
      res.status(500).json({ error: `There was an error trying to retrieve the post with ID ${id}`});
    })
};

module.exports = router;