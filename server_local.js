//MySQL + Node.js 접속
let mysql = require('mysql');
let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '123456',
    database : 'myboard',
    port : 3306
});

conn.connect();


const express = require('express');
const app = express();

const passport = require("passport");
const localStrategy = require('passport-local').Strategy;


//body-parser 라이브러리 추가
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

//cookie-parser 라이브러리 추가
const cookieParser = require('cookie-parser');
app.use(cookieParser('dkfjdifu39f984'));

//세션 라이브러리 추가
const session = require('express-session');
app.use(session({
    secret : 'dkfjdiue9343j9',
    resave : false,
    saveUninitialized : true
}))

app.use(passport.initialize());
app.use(passport.session());


const sha = require('sha256');

app.set('view engine', 'ejs');
//정적 파일 라이브러리 추가
app.use(express.static("public"));

//MongoDB 연동
let mydb;
const mongoClient = require('mongodb').MongoClient;
const url = 
'mongodb+srv://admin:1234@cluster0.airyv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoClient.connect(url).then(client=>{
    console.log('몽고DB 접속');
    mydb = client.db('myboard');
   
    app.listen(8081, function(){
        console.log("포트 8081으로 서버 대기...");
    });
})

const ObjId = require('mongodb').ObjectId;

// app.listen(8081, function(){
//     console.log("포트 8081으로 서버 대기...");
// });


app.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if(isNaN(milk))
    {
        milk = 0;
    }
    res.cookie('milk', milk, {signed : true}); //cookie(키, 값)
    //res.send('product : ' + milk + "원");
}) 

app.get('/session', function(req, res){
    if(isNaN(req.session.milk))
    {
        req.session.milk = 0;
    }
    req.session.milk = req.session.milk + 1000;
    res.send('product : ' + req.session.milk + "원");
}) 

app.get('/book', function(req, res){
    res.send('도서 목록 관련 페이지입니다.');
})

app.get('/', function(req, res){  
    console.log(req.session.user); 
    if(req.session.passport){  
        res.render("index.ejs", {user : req.session.passport});
    }else{
        res.render("index.ejs", {user : null});
    }
})

app.get('/list', function(req, res){
    mydb.collection('post').find().toArray().then((result)=>{
        // console.log(result);

        res.render('list.ejs', { data : result});
    })
    // res.sendFile(__dirname + '/list.html');
})

app.get('/enter', function(req, res){     
    // res.sendFile(__dirname + '/enter.html');
    res.render('enter.ejs');
})

app.post('/save', function(req, res){    
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);

    //몽고DB에 데이터 저장
    mydb.collection('post').insertOne(
        {title : req.body.title, content : req.body.content, date : req.body.someDate }
    ).then((result)=>{
        console.log(result);
        console.log('데이터 저장완료');
        res.redirect('/list');
    });


    // let sql = "insert into post (title, content, created) \
    //     values (?, ?, now())";
    // let params = [req.body.title, req.body.content];
    // conn.query(sql, params, function(err, result){
    //     if(err) throw err;
    //     console.log('데이터 저장완료');    
    // })
})

app.post('/delete', function(req, res){    
    console.log(req.body._id);
    req.body._id = new ObjId(req.body._id);
    console.log(req.body._id);
    mydb.collection('post').deleteOne(req.body)
    .then((result)=>{
        console.log('삭제완료');
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
    // res.sendFile(__dirname + '/enter.html');
    console.log("edit:id " + req.params.id);

    req.params.id = new ObjId(req.params.id);
    mydb.collection('post').findOne({_id : req.params.id})
    .then(result=>{
        console.log(result);
        res.render('edit.ejs', {data : result});
    })   
})

app.post('/edit', function(req, res){    
    console.log("req body : " + req.body.id);
    req.body.id = new ObjId(req.body.id);

    console.log(req.body.id);
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.someDate);
    //몽고DB에 데이터 저장
    mydb.collection('post').updateOne(
        {_id : req.body.id}, 
        {$set : {title : req.body.title, content : req.body.content, date : req.body.someDate}}
    ).then((result)=>{
        console.log(result);
        console.log('수정 완료');
        res.redirect('/list');
    })
    .catch((err)=>{
        console.log(err);
    })
})

app.get('/login', function(req, res){
    console.log(req.session);
    if(req.session.user){
        console.log('세션유지');
        res.render('index.ejs', {user : req.session.user});
    }else{
        res.render("login.ejs");
    }  
})

passport.serializeUser(function(user, done){
    console.log("serializeUser");
    console.log(user.userid);
    done(null, user.userid);
});

passport.deserializeUser(function(puserid, done){
    console.log("deserializeUser");
    console.log(puserid);

    mydb.collection("account").findOne({userid : puserid})
    .then((result)=>{
        console.log(result);
        done(null, result);
    })
})

app.post('/login', 
    passport.authenticate("local", {
        succeessRedirect : '/',
        failureRedirect:"/fail",
    }),

    function(req, res){
    console.log("session : " + req.session);
    console.log(req.session.passport);

    res.render('index.ejs', {user : req.session.passport});
    }
);

// done(서버 에러 객체, 결과 데이터, 에러 메시지)

passport.use(
    new localStrategy(
        {
            usernameField : "userid",
            passwordField : "userpw",
            session : true,
            passReqToCallback : false,
        },
        function(inputid, inputpw, done){

            mydb.collection("account").findOne({userid : inputid})
            .then((result)=>{
                console.log(result);
                if(result.userpw == sha(inputpw)){
                    console.log('새로운 로그인');
                    done(null, result);
                }else{
                    done(null, false, {message : "비밀번호가 틀렸습니다."});
                }
            })
        }
    )
)


app.get('/logout', function(req, res){
    console.log('로그아웃');
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

    //몽고DB에 데이터 저장
    mydb.collection('account').insertOne(
        {
            userid : req.body.userid,
            userpw : sha(req.body.userpw), 
            usergroup : req.body.usergroup, 
            useremail : req.body.useremail
        })
        .then((result)=>{
            console.log('회원가입 성공');
            res.redirect('/login');
        });
})