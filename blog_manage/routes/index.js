var express = require('express');
var ueditor = require("ueditor");
var router = express.Router();
var usr=require('dao/dbConnect');
var markdownMode = require('markdown').markdown;

/* GET home page. */
router.get('/', function(req, res) {
  res.render('manage_add_blog', { title: '添加博文信息' });
});

router.post('/post/addblog', function(req, res) {
  console.log(req.body.blog_context+"--req.body==");
 // var content = markdownMode.toHTML(req.body.blog_context);
  var blogJson = {
      "blog_name":req.body.blog_name,
      "blog_author":req.body.blog_author,
      "blog_time":req.body.blog_time,
      "blog_type":req.body.blog_type,
      "blog_context":req.body.blog_context
  };
  console.log("blogJson=="+JSON.stringify(blogJson));
  var client = usr.connect();
  usr.insertBlog(client,JSON.stringify(blogJson), function (result) {
    res.redirect("/");
  });
});
module.exports = router;


