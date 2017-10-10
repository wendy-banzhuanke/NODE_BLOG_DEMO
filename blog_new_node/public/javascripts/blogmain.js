/**
 * Created by dell on 2017/2/24.
 */
function addLoadEvent(func){
    var oldOnLoad = window.onload;
    if(typeof window.onload != 'function'){
        window.onload = func;
    }else{
        window.onload = function () {
            oldOnLoad();
            func();
        }
    }
}
/*
* banner轮播
* */
function bannerSlide(){
    /* 知识点：        */
    /*       this用法 */
    /*       DOM事件 */
    /*       定时器 */
        var container = document.getElementById('banner');
            list = document.getElementById('bannerList'),
            buttons = document.getElementById('handle').getElementsByTagName('span'),
            prev = document.getElementById('leftBtn'),
            next = document.getElementById('rightBtn');

        var index = 1;
        var timer;
        function animate(offset) {
            //获取的是style.left，是相对左边获取距离，所以第一张图后style.left都为负值，
            //且style.left获取的是字符串，需要用parseInt()取整转化为数字。
            var newLeft = parseInt(list.style.left) + offset;
            list.style.left = newLeft + 'px';
            //无限滚动判断
            if (newLeft > 0) {
                list.style.left = -1344 + 'px';
            }
            if (newLeft < -1344) {
                list.style.left = 0 + 'px';
            }
        }
        function play() {
            //重复执行的定时器
            timer = setInterval(function () {
                next.onclick();
            }, 2000)
        }
        function stop() {
            clearInterval(timer);
        }
    function buttonsShow() {
        //将之前的小圆点的样式清除
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].className == "on") {
                buttons[i].className = "";
            }
        }
        //数组从0开始，故index需要-1
        buttons[index - 1].className = "on";
    }
        prev.onclick = function () {
            index -= 1;
            if (index < 1) {
                index = 3
            }
            buttonsShow();
            animate(672);
        };
        next.onclick = function () {
            //由于上边定时器的作用，index会一直递增下去，我们只有5个小圆点，所以需要做出判断
            index += 1;
            if (index > 3) {
                index = 1
            }
            animate(-672);
            buttonsShow();
        };
        for (var i = 0; i < buttons.length; i++) {
            (function (i) {
                buttons[i].onclick = function () {
                    /*  这里获得鼠标移动到小圆点的位置，用this把index绑定到对象buttons[i]上，去谷歌this的用法  */
                    /*  由于这里的index是自定义属性，需要用到getAttribute()这个DOM2级方法，去获取自定义index的属性*/
                    var clickIndex = parseInt(this.getAttribute('index'));
                    var offset = 672 * (index - clickIndex); //这个index是当前图片停留时的index
                    animate(offset);
                    index = clickIndex; //存放鼠标点击后的位置，用于小圆点的正常显示
                    buttonsShow();
                }
            })(i)
        }
        container.onmouseover = stop;
        container.onmouseout = play;
        play();
}
/*
* 返回顶部
* */
function backTop(){
    document.getElementById('backTop').onclick = function(){
        document.documentElement.scrollTop = document.body.scrollTop =0;
    }
}
/*
* 加载更多
* */
function addMore(){
    $('#addMore').on('click',function (event) {
        var pageNoOld = Number($('#pageNo').val()),
            pageSize = Number($('#pageSize').val()),
            blogTypeId = $('#blogTypeId').val(),
            q = $('#q').val();

        pageNo = Number(pageNoOld)+Number(pageSize);//从第几条开始显示

        $.ajax({
            url:'/blog/addMore/',
            type:'get',
            dataType:'json',
            data:{"pageNo":pageNo,"blogTypeId":blogTypeId,"q":q}
        }).done(function (data) {
            if(data!=null&&data!=""){
                var sum = data[0].length;

                if(sum - pageNoOld < pageSize ){
                    pageSize = sum - pageNo;
                    $('#addMoreDiv').css('display','none');
                }
                var articleHtml = '';
                data[0].forEach(function(item,index){
                    articleHtml += '<dl class="clearfix">' +
                        '<dd class="author clearfix">' +
                            '<a href="#" target="_blank"><img src="images/author01.jpg" alt="文章作者"></a>' +
                            '<div class="name">' +
                            '<a onclick="bolgReadNum('+item.id+');"  href="/blog/blogDetails/'+item.id+'" target="_blank">'+item.blog_author+'</a>' +
                            '<span class="time">'+new Date(item.blog_time).Format("yyyy-MM-dd hh:mm:ss")+'</span>' +
                            '</div>' +
                        '</dd>' +
                        '<dd class="title">' +
                            '<a onclick="bolgReadNum('+item.id+');"   href="/blog/blogDetails/'+item.id+'" target="_blank">'+item.blog_name+'</a>' +
                        '</dd>' +
                        '<dd class="article">' +
                            '<p class="article-p">' +
                            ''+item.blog_context+''+
                            '</p>' +
                        '</dd>' +
                        '<dd class="meta">' +
                        '<a onclick="bolgReadNum('+item.id+');"   href="/blog/blogDetails/'+item.id+'" target="_blank">' +
                            '<i class="fa fa-eye" aria-hidden="true"></i>'+item.blog_look+'' +
                        '</a>' +
                        '<a  onclick="bolgReadNum('+item.id+');"  href="/blog/blogDetails/'+item.id+'" target="_blank">' +
                            '<i class="fa fa-comments" aria-hidden="true"></i>'+item.blog_comment+'' +
                        '</a>' +
                        '<span>' +
                            '<i class="fa fa-heart" aria-hidden="true"></i>'+item.blog_zan+'' +
                        '</span>' +
                        '<span>' +
                            '<i class="fa fa-jpy" aria-hidden="true"></i>'+item.blog_reward+'' +
                        '</span>' +
                        '</dd>' +
                        '</dl>'
                });

                $('#pageNo').val(pageNo);
                $('#q').val(q);
                $('#listArticle').append(articleHtml);
                limtArticle();
            }else{
                $('#addMoreDiv').css('display','none');
            }
        }).fail(function (data) {
            console.log("网络错误");
        });
    });
}


function limtArticle(){//员工：超过5个字符 其他显示...
    $(".article").each(function () {
        $(this).children(".article-p").text($(this).children(".article-p2").children("p:first").text()+"...");
        $(this).children(".article-p2").text("");
    });
}

/*
* 回复评论容器
* parentId 父级id
* bycritic 被回复name
* bycriticId 被回复id
* */
function answerComment($_wrap,parentId,bycritic,bycriticId){
       var answerWrapHtml = '<div class="comment-wrap-1 comment-wrap" id="commentWrap">' +
            '<form action=""  accept-charset="UTF-8" method="post" id="answer_form">' +
                '<div class="comment-person">' +
                    '<label for="wrap1_email">我的邮箱:</label><input id="wrap1_email" name="myemail" type="text" placeholder="我的邮箱"/>' +
                    '<label for="wrap1_petname">我的昵称:</label><input id="wrap1_petname"  name="mypetname" type="text" placeholder="我的昵称"/>' +
                '</div>' +
                '<span class="format-tip-email1"></span><span class="format-tip-petname1"></span><span class="format-tip-context1"></span>' +
                '<div class="comment-text">' +
                    '<textarea id="wrap1_context" name="mycontext"  placeholder="我的评论@'+bycritic+':"></textarea>' +
                '</div>' +
                '<div class="comment-btn">' +
                    '<a href="javascript:;" onclick="commentWrapCancel();">取 消</a>' +
                    '<a href="javascript:;" onclick="addAnswerComment($(this),\''+parentId+'\',\''+bycritic+'\',\''+bycriticId+'\');">提 交</a>' +
                '</div>' +
            '</form>' +
        '</div>';

    if($('#commentWrap')){
        $('#commentWrap').remove();
    }

    $($_wrap).append(answerWrapHtml);

}
/*
* 点击回复评论
* */
function answerCommentClick($this,parentId,bycritic,bycriticId){

    var $_answerWrap = $this.parents('.comment-li').find('.comment-sub-list');
    answerComment($_answerWrap,parentId.trim(),bycritic.trim(),bycriticId.trim());
}
/*
* 取消评论
* */
function commentWrapCancel(){
    if($('#commentWrap')){
        $('#commentWrap').remove();
    }
}
/*
* 回复评论
* */
function addAnswerComment($this,parentId,bycritic,bycriticId){
    resetCommentSubTip();
    var myemail = $("#wrap1_email").val();
    var mypetname = $("#wrap1_petname").val();
    var mycontext = $("#wrap1_context").val();
    if(validCommentSub($("#wrap1_email"),$("#wrap1_petname"),$("#wrap1_context"))){
        resetCommentSubTip();
        //javascript:document:answer_form.submit();
        var blog_id = $('#detail_blog_id').val();
        $.ajax({
            url:'/blog/answer/'+blog_id+'',
            type:'post',
            dataType:'json',
            data:{  "myemail":myemail,
                "mypetname":mypetname,
                "mycontext":mycontext,
                "parentId":parentId.trim(),
                "bycritic":bycritic.trim(),
                "bycriticId":bycriticId.trim()
            }
        }).done(function (results) {
            var subCommentHtml = '<div class="comment-sub">' +
                '<p>' +
                '<a href="#">'+results.petname+':</a>' +
                '<span><a href="/users/6bc676efa44a" class="maleskine-author" target="_blank" data-user-slug="6bc676efa44a">'+results.bycritic+'</a>&nbsp;'+results.context+'</span> ' +
                '</p>' +
                '<div class="sub-tool-btn">' +
                '<span>'+results.commentTime+'</span>' +
                '<a href="javascript:;" class="answer-edit-btn"  onclick="answerCommentClick($(this),\''+results.parentId+'\',\''+results.petname+'\',\''+results.id+'\');"><i class="fa fa-edit"></i>回复</a> ' +
                '</div>' +
                '</div>';
            $this.parents('.comment-li').find('.comment-answer-wrap').append(subCommentHtml);
            commentTipAnimate();
            commentWrapCancel();
            updateBlogNum();
        }).fail(function (data) {
            console.log("网络错误");
        });
    }
}

/*
 * 发布评论
 * */
function publishAnswerComment(){
    resetCommentParentTip();
    var myemail = $("#wrap0_email").val();
    var mypetname = $("#wrap0_petname").val();
    var mycontext = $("#wrap0_context").val();
    if(validCommentParent($("#wrap0_email"),$("#wrap0_petname"),$("#wrap0_context"))){
        resetCommentParentTip();
        //javascript:document:answer_form.submit();
        var blog_id = $('#detail_blog_id').val();
        $.ajax({
            url:'/blog/answer/'+blog_id+'',
            type:'post',
            dataType:'json',
            data:{  "myemail":myemail,
                "mypetname":mypetname,
                "mycontext":mycontext,
                "parentId":"0",
                "bycritic":blog_id,
                "bycriticId":blog_id
            }
        }).done(function (results) {
            var commentHtml = '<li class="comment-li">' +
                '<div class="comment-parent">' +
                '<div class="comment-person">' +
                '<dl class="clearfix">' +
                '<dt class="fl">' +
                '<a href="#"><img src="/images/timg.jpg"/></a>' +
                '</dt>' +
                '<dd class="name">' +
                '<span>'+results.petname+'</span>' +
                '</dd>' +
                '<dd class="time">' +
                '<span>'+results.commentTime+'</span>' +
                '</dd>' +
                '</dl>' +
                '</div>' +
                '<p>'+results.context+'</p>' +
                '<div class="tool-btn">' +
                '<a href="javascript:;" class="answer-edit-btn" onclick="answerCommentClick($(this),\''+results.id+'\',\''+results.petname+'\',\''+results.id+'\');"><i class="fa fa-edit"></i>回复</a> ' +
                '</div>' +
                '</div>' +
                '<div class="comment-sub-list comment-answer-wrap"></div></li>';

            $('.comment-ul').prepend(commentHtml);
            commentTipAnimate();
            resetAnswerComment();
            updateBlogNum();

        }).fail(function (data) {
            console.log("网络错误");
        });
    }
}
/*
 * 清空发布评论
 * */
function resetAnswerComment(){
    $("#wrap0_email").val("");
    $("#wrap0_petname").val("");
    $("#wrap0_context").val("");
}
/*
* 评论表单验证——父级评论
* */
function validCommentParent($email,$petname,$context){
    //邮箱验证
    if($email.val()=="")
    {
        $('.format-tip-email0').text("*邮箱不能为空");
        return false;
    }
    if(!$email.val().match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/))
    {
        $('.format-tip-email0').text("*邮箱格式不正确！请重新输入");
        return false;
    }
    //昵称验证
    if($petname.val()==""){
        $('.format-tip-petname0').text("*昵称不能为空");
        return false;
    }

    var reg =new RegExp("^.*带着帕克的wendy.*$");
    if(reg.test($petname.val())){
        $('.format-tip-petname0').text("*与博主撞名鸟~！请重新输入");
        return false;
    }

    if($petname.val().length > 20){
        $('.format-tip-petname0').text("*昵称太长了，博主的大脑已经内存溢出啦...！请重新输入");
        return false;
    }
    //内容验证
    if($context.val()==""){
        $('.format-tip-context0').text("*内容不能为空");
        return false;
    }
    if($context.val().length > 400){
        $('.format-tip-context0').text("*内容太长了，博主的大脑已经内存溢出啦...！请重新输入");
        return false;
    }

    return true;
}
/*
 * 清空评论表单验证提示信息
 * */
function resetCommentParentTip(){
    $(".format-tip-email0").text("");
    $(".format-tip-petname0").text("");
    $(".format-tip-context0").text("");
}
/*
 * 评论表单验证——子级评论
 * */
function validCommentSub($email,$petname,$context){
    //邮箱验证
    if($email.val()=="")
    {
        $('.format-tip-email1').text("*邮箱不能为空");
        return false;
    }
    if(!$email.val().match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/))
    {
        $('.format-tip-email1').text("*邮箱格式不正确！请重新输入");
        return false;
    }
    //昵称验证
    if($petname.val()==""){
        $('.format-tip-petname1').text("*昵称不能为空");
        return false;
    }

    var reg =new RegExp("^.*带着帕克的wendy.*$");
    if(reg.test($petname.val())){
        $('.format-tip-petname1').text("*与博主撞名鸟~！请重新输入");
        return false;
    }

    if($petname.val().length > 20){
        $('.format-tip-petname1').text("*昵称太长了，博主的大脑已经内存溢出啦...！请重新输入");
        return false;
    }
    //内容验证
    if($context.val()==""){
        $('.format-tip-context1').text("*内容不能为空");
        return false;
    }
    if($context.val().length > 400){
        $('.format-tip-context1').text("*内容太长了，博主的大脑已经内存溢出啦...！请重新输入");
        return false;
    }

    return true;
}
/*
 * 清空评论表单验证提示信息
 * */
function resetCommentSubTip(){
    $(".format-tip-email1").text("");
    $(".format-tip-petname1").text("");
    $(".format-tip-context1").text("");
}
/*
* 发布评论之后，更新页面博文评论数量
* */
function updateBlogNum(){
    var commentNum = Number($('#blog_comment').text())+1;
    $('#blog_comment').text(commentNum);
}
/*
 * 发布评论之后，浮动框向上动画提示”评论成功“
 * */
function commentTipAnimate(){
    $('.comment-tip-success-fiexd').css({'display':'block'});
    $('.comment-tip-success-fiexd').animate({'top':'20%','opacity':'1'},1100, function () {
        $('.comment-tip-success-fiexd').css({'top':'60%','display':'none','opacity':'0'});
    });
}
/*
* 博客攒：喜欢+1，要在浏览器的cookie中标注
* */
function blogZan($this){
    var blog_id = $('#detail_blog_id').val(),zannum = 0,url;

    if (localStorage) {
        /*
         * 读出localstorage中的值
         */
        if (localStorage['zannum'+blog_id]) {
            zannum = 1;
        }
    }

    url = '/blog/zan/'+blog_id+'/'+zannum;

    if(zannum == 0){
        $('.zannum').text('+1');
        $.ajax({
            url:url,
            type:'get',
            dataType:'json'
        }).done(function (data) {
            var zanNum = Number($this.find('.blog-zan-num').text())+1;
            $('#blog_zan_num').text(zanNum);
            $this.find('.blog-zan-num').text(zanNum);
            $this.find('.fa').removeClass('fa-heart-o').addClass('fa-heart');
            $this.find('.word').text('已喜欢');
            zanAnimate();
            localStorage['zannum'+blog_id] =zanNum;

        }).fail(function (data) {
            console.log("网络错误");
        });
    }else{
        $('.zannum').text('-1');
        $.ajax({
            url:url,
            type:'get',
            dataType:'json'
        }).done(function (data) {
            var zanNum = Number($this.find('.blog-zan-num').text())-1;
            $('#blog_zan_num').text(zanNum);
            $this.find('.blog-zan-num').text(zanNum);
            $this.find('.fa').removeClass('fa-heart').addClass('fa-heart-o');
            $this.find('.word').text('喜欢');
            zanAnimate();
            localStorage.removeItem('zannum'+blog_id);
        }).fail(function (data) {
            console.log("网络错误");
        });

    }

}
/*
* 博文点赞时：数字向上漂浮
* */
function zanAnimate(){
    $('.zannum').css({'display':'block'});
    $('.zannum').animate({'bottom':'90px','opacity':'1'},800, function () {
        $('.zannum').css({'display':'none','bottom':'10px','opacity':'0'});
    });
}

/*
* 博文阅读数量
* */
function bolgReadNum(blogId){
        if (localStorage) {
            /*
             * 读出localstorage中的值
             */
            if (!localStorage['blogReadNum'+blogId]) {
                $.ajax({
                    url:'/blog/readnum/'+blogId,
                    type:'get',
                    dataType:'json'
                }).done(function (data) {
                    var readNum = Number($('#blog_look').text())+1;
                    $('#blog_look').text(readNum);
                    localStorage['blogReadNum'+blogId] =readNum;
                })
            }
        }
}
/*
*  发送邮件
* */
function sendMail(){
    alert("邮件发送成功！");
}

//addLoadEvent(bannerSlide);
addLoadEvent(backTop);
addLoadEvent(addMore);
addLoadEvent(limtArticle);


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

