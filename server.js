const ObjId = require('mongodb').ObjectId;

//MySQL + Node.js 접속

let mysql = require('mysql');
let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password: '123456',
    database : 'myboard',

})

conn.connect();
//connect(): mysql 서버와 연결




const express = require('express');
const app = express();

const dotenv = require('dotenv').config()

//multer 라이브러리 추가
let multer = require('multer');
let storage = multer.diskStorage({
    destination : function(req, file, done){
        done(null, './public/image')//클라이언트로부터 받은 이미지를 저장할 위치 지정
    },
    filename : function(req, file, done){
        done(null, file.originalname);
    }
})

let upload = multer({storage : storage});


//body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser('dkfjdifu39f984'));


app.set('view engine', 'ejs');
//정적 파일 라이브러리 추가
//app.use(express.static('public'));
app.use("/public", express.static('public'));

app.use('/', require('./routes/post.js'))
app.use('/', require('./routes/add.js'))
app.use('/', require('./routes/auth.js'))

app.listen(process.env.PORT, function () {
    console.log("포트 8081로 서버 대기...")
})
//포트 8081로 접근하면 텍스트 출력

app.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk))
    {
        milk = 0;
    }
    res.cookie('milk', milk, {signed : true}); //cookie(키, 값)
    res.send('product : ' + milk + "원");
})

app.get('/session', function(req,res){
    //브라우저에서 session으로 요청
    if(isNaN(req.session.milk))
    {
        req.session.milk = 0
    }
    req.session.milk = req.session.milk + 1000;
    res.send('product: ' + req.session.milk + '원')
})

app.get('/', function(req, res){
    if(req.session.user){
        res.render('index.ejs',{user : req.session.user});
    }else{
    res.render('index.ejs', {user : null});
}})





    //MySQL에 데이터 저장
    // let sql = "insert into post (title, content, created) \
    //     values(?, ?, now())";
    // let params = [req.body.title, req.body.content];
    // conn.query(sql, params, function(err, result){
    //     if(err) throw err;
    //     console.log('저장완료')
    // })
    // res.send('데이터 저장 완료')
    // })

    



app.get('/mongoList', function(req, res){
    res.send('데이터 베이스를 조회합니다.');
    mydb.collection('post').find().toArray().then(result => {
        console.log(result);

    })
})

app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지 입니다.');
})

app.post('/delete', function(req, res){
    console.log(req.body)
    req.body._id = new ObjId(req.body._id);
    mydb.collection('post').deleteOne(req.body)
    .then(result => {
        console.log('삭제 완료');
        res.status(200).send();
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send();
    })
})
app.get('/content/:id', function(req, res){  
    console.log(req.params.id);  
    req.params.id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : req.params.id})
    .then(result=>{
        console.log(result);
        res.render('content.ejs', {data : result});
    })   
})

app.get('/edit/:id', function(req, res){
    req.params.id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : req.params.id})
    .then(result=>{
        console.log(result);
        res.render('edit.ejs', {data : result});
    })
    
})

app.post('/edit', function(req, res){
    console.log(req.body)
    req.body.id =new ObjId(req.body._id);
    console.log(req.body.id)
    console.log(req.body.title)
    console.log(req.body.content)
    console.log(req.body.someDate)

    //몽고DB에 데이터 저장
    mydb.collection('post').updateOne(
        {_id : req.body.id},
        {$set : {title : req.body.title, content : req.body.content, date : req.body.someDate}}
        //updateOne()은 2개의 전달인자 필요,
        //첫번째 인자 id
        //두번째 인자 옵션 중 하나가 set,
        //기존의 데이터가 있다면 덮어쓰겠다.
    ).then((result)=>{
        console.log('result');
        console.log('수정 완료');
        res.redirect('/list');
        //list 페이지로 리다이렉트
    })
    .catch(err=>{
        console.log(err);
    })
})




app.get('/logout', function(req, res){
    console.log('로그아웃')
    req.session.destroy();
    res.render("index.ejs", {user : null});
})

app.get('/signup', function(req, res){
    console.log('회원가입');
    res.render("signup.ejs");
})

app.post('/signup', function(req, res){
    console.log(req.body.userid);
    console.log(sha(req.body.userpw));
    console.log(req.body.usergroup);
    console.log(req.body.useremail);
    
    //몽고db 저장
    mydb.collection('account').insertOne({
        userid: req.body.userid,
        userpw: sha(req.body.userpw),
        usergroup: req.body.usergroup,
        useremail: req.body.useremail
    })
    .then(()=>{
        console.log('회원가입 성공');
        res.redirect('/login');
    })
})

let imagepath = '';

app.post('/photo', upload.single('picture'), function(req, res){
    //single, 단일 파일
    //array, 다중 파일
    //프론트엔드에서 넘겨준 이미지 데이터를 받아올 수 있음.
    
    console.log(req.file.path);
    imagepath = '\\' + req.file.path;
    //'DB'에는 이미지 자체를 저장하지 않고, '이미지 경로'만 저장한다.
    //이미지 파일은 '서버'의 파일 시스템에 저장 
})

app.post('/save', function(req, res){
    console.log(req.body.title)
    console.log(req.body.content)
    console.log(req.body.someDate)

    //몽고DB에 데이터 저장
    mydb.collection('post').insertOne({
        title: req.body.title,
        content: req.body.content,
        date: req.body.someDate,
        path : imagepath
    }).then((result)=>{
        console.log('result');
        console.log('데이터 저장완료');
        res.redirect('/list');
    })
})

app.get('/search', function(req, res){
    console.log(req.query);
    mydb.collection('post')
    .find({title : req.query.value}).toArray()
    .then((result)=>{
        console.log(result);
        res.render("sresult.ejs", {data : result})
    })
})