var express = require('express');
var Promise = require('bluebird');
var mysql = require('mysql');
var moment = require('moment');
var nodemailer = require('nodemailer');
var dao = require('dao/dbConnect')
var router = express.Router();

var pageNo = 0;
var pageSize = 2;
var client = dao.connect();

/*
* 博客首页
* */
router.get('/', function(req, res, next) {
  var blogTypeId = req.query.blogTypeId;
  var hotTime = req.query.hotTime;
  var searchText = req.query.q;
//
  Promise.all([getBlogTypeData(client),getBlogListData(client,pageNo,pageSize,blogTypeId,hotTime,searchText)])
      .then(function (results) {
          res.render('index',{
              title :'博客首页',
              blogTypeRes : results[0],
              blogListRes : results[1],
              pageNo : pageNo,
              pageSize : pageSize,
              blogTypeId : blogTypeId,
              searchText: searchText,
              moment:moment
          });
  });

});

/*
* 点击“类别”跳转页面
* */
router.get('/blog/blogType/:id(\\d{1,10})', function (req,res,next) {
  var blogTypeId = req.params.id;
  res.redirect('/?blogTypeId='+blogTypeId);
});

/*
* 加载更多
* */
router.get('/blog/addMore/', function (req,res,next) {
    var blogTypeId = req.query.blogTypeId;
    var pageNo = req.query.pageNo;
    var q = req.query.q;

  Promise.all([getBlogListData(client,pageNo,pageSize,blogTypeId,undefined,q)])
      .then(function (results) {
        res.send(JSON.stringify(results));
  })
});

/*
* 全文搜索
* */
router.get('/blog/search/', function (req,res,next) {
    var q = req.query.q;
    res.redirect('/?q='+q);
});

/*
*  博客详情页
* */
router.get('/blog/blogDetails/:id(\\d{1,10})', function (req,res,next) {
    var blogId = req.params.id;

    Promise.all([getBlogDetailsData(client,blogId),getBlogCommentData(client,blogId),getBlogCommentSubData(client,blogId)])
        .then(function (results) {
            res.render('blog_details',{
                title :'博客详情页',
                blogDetails:results[0],
                blogComment:results[1],
                blogCommentSub:results[2],
                moment:moment
            });
    });

});
/*
* 回复评论
* */
router.post('/blog/answer/:id(\\d{1,10})', function (req,res,next) {
    var blogId = req.params.id;
    var email = req.body.myemail;
    var petname = req.body.mypetname;
    var context = req.body.mycontext;
    var parentId = req.body.parentId;
    var bycritic = req.body.bycritic;
    var bycriticId = req.body.bycriticId;
    var commentTime = getNowFormatDate();

    Promise.all([addBlogComment(client,email,petname,context,commentTime,blogId,parentId,bycritic,bycriticId)])
        .then(function (results) {
            var currentCommentJson = {"id":results,"petname":petname,"context":context,"bycritic":bycritic,"commentTime":commentTime,"parentId":parentId}
            res.write(JSON.stringify(currentCommentJson));
            res.end();
    });

});
/*
* 博文赞数修改
* */
router.get('/blog/zan/:id(\\d{1,10})/:zannum(\\d{1,10})', function (req,res,next) {
    var blogId = req.params.id;
    var zan = req.params.zannum;
    if(zan == 0){
        Promise.all([addBlogZan(client,blogId)])
            .then(function (results) {
                var returnJson = {"status":"200"};
                res.write(JSON.stringify(returnJson));
                res.end();
            });
    }else{
        Promise.all([subBlogZan(client,blogId)])
            .then(function (results) {
                var returnJson = {"status":"200"};
                res.write(JSON.stringify(returnJson));
                res.end();
            });
    }
});
/*
 * 博文阅读访问量+1
 * */
router.get('/blog/readnum/:id(\\d{1,10})', function (req,res,next) {
    var blogId = req.params.id;

    Promise.all([addBlogReadNum(client,blogId)])
        .then(function (results) {
            res.write(JSON.stringify(results));
            res.end();
    });
});


/*联系我*/
router.get('/contactme/', function(req, res) {
    res.render('blog_countus', {
        title:'联系Wendy'
    });
});

/*
* 通过博客id获取博客详情信息
* */
function getBlogDetailsData(client,blogId){
    return new Promise(function (resolve,reject) {
        dao.selectBlogDetails(client,blogId, function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    })
}

/*
* 获取评论列表 parent=0
* */
function getBlogCommentData(client,blogId){
    return new Promise(function (resolve,reject) {
        dao.selectBlogComment(client,blogId, function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    });
}

/*
 * 获取评论列表 parent!=0
 * */
function getBlogCommentSubData(client,blogId){
    return new Promise(function (resolve,reject) {
        dao.selectBlogCommentSub(client,blogId, function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    });
}

/*
* 获取博客类别数据
* */
function getBlogTypeData(client){
  return new Promise(function (resolve,reject) {
    dao.selectBlogTypeList(client, function (results) {
      if(resolve){
        resolve(results);
      }else{
        reject(error);
      }
    });
  });
}

/*
 * 获取博客列表数据
 * */
function getBlogListData(client,pageNo,pageSize,blogTypeId,hotTime,searchText){
  return  new Promise(function (resolve,reject) {
    dao.selectBlogList(client,pageNo,pageSize,blogTypeId,hotTime,searchText, function (results) {
      if(resolve){
        resolve(results);
      }else{
        reject(error);
      }
    });
  });
}
/*
* 添加博客评论
* */
function addBlogComment(client,manEmail,manPetName,manContext,commentTime,blogId,parentId,bycritic,bycriticId){
    return new Promise(function (resolve,reject) {
        dao.insertBlogComment(client,manEmail,manPetName,manContext,commentTime,blogId,parentId,bycritic,bycriticId,function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    });
}
/*
* 博文赞数+1
* */
function addBlogZan(client,blogId){
    return new Promise(function (resolve,reject) {
        dao.updateBlogZanAdd(client,blogId,function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    });
}
/*
 * 博文赞数-1
 * */
function subBlogZan(client,blogId){
    return new Promise(function (resolve,reject) {
        dao.updateBlogZanSub(client,blogId,function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    });
}
/*
 * 博文阅读量+1
 * */
function addBlogReadNum(client,blogId){
    return new Promise(function (resolve,reject) {
        dao.updateBlogLook(client,blogId,function (results) {
            if(resolve){
                resolve(results);
            }else{
                reject(error);
            }
        });
    });
}
/*
* 返回日期格式为yyyy-MM-dd HH:mm:ss
* */
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
}


//配置邮件
//var transporter = nodemailer.createTransport('SMTP',{
//    host: "smtp.163.com",
//    secureConnection: true,
//    port:465,
//    auth: {
//        user: '13522225365@163.com',
//        pass: 'zj101314',
//    }
//});
var transporter = nodemailer.createTransport({
    /*host: "smtp.163.com",*/
    host:"smtp.163.com",
    secureConnection: true,
    port:465,
    auth: {
        user: '13522225365@163.com',
        pass: 'zj101314',
    }
});

//发送邮件
var sendmail = function(toAddress,emailContext,sendPersonName){
    if(emailContext!=""){
        var option = {
            from:"13522225365@163.com",
            to:"13522225365@163.com",
        }
        option.subject = 'Wendy’s Blog 邮件'+moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        option.html= sendPersonName+"【"+toAddress+"】 : "+emailContext;
        transporter.sendMail(option, function(error, response){
            if(error){
                console.log("fail: " + error);
            }else{
                console.log("success: " + response.message);
            }
        });
    }
}

//调用发送邮件
router.post('/contactme/sendemail', function(req, res) {
    var emailJson = {
        "emial_name":req.body.emial_name,
        "email_address":req.body.email_address,
        "email_context":req.body.email_context
    };
    sendmail(emailJson['email_address'],emailJson['email_context'],emailJson['emial_name']);
    res.redirect("/contactme/");
});


module.exports = router;
