var router = require('express').Router();

//MongoDB 연동
let mydb;

//MongoDB 접속
const mongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URL;
mongoClient.connect(url).then(client => {
    console.log('몽고DB 접속');
    mydb = client.db('myboard'); //스키마? 접근
    mydb.collection('post'); //컬렉션(테이블?) 접근
})

//세션 라이브러리 추가
const session = require('express-session');
router.use(session({
    secret : 'dkfjdiue9343j9', //암호화를 하기 위한 재료??
    resave : false, // 세션을 접속할 때마다 새로운 식별자 발급할 지 여부
    saveUninitialized : true, // 세션을 사용하기 전까지 식별자를 발급하지 않도록 하겠다.
}));

//암호화
const sha = require('sha256');

router.get('/login', function(req, res){
    console.log(req.session)
    if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user});
    } else {
        res.render('login.ejs');
    }
    
})

// app.post('/login', function(req, res){
//     console.log(req.body.userid);
//     console.log(req.body.userpw);

//     mydb.collection("account").findOne({userid : req.body.userid})
//     .then((result)=>{
//         console.log(result);
//         if(result.userpw == req.body.userpw){
//             req.session.user = req.body;
//             console.log('새로운 로그인');
//             res.render('index.ejs', {user : req.session.user});
//         }else{
//             res.render('login.ejs');
//         }
//     })
// })

router.post('/login', function(req, res){
    console.log(req.body.userid);
    console.log(req.body.userpw);

    mydb.collection("account").findOne({userid : req.body.userid})
    .then((result)=>{
        console.log(result);
        if(result.userpw == sha(req.body.userpw)){
            req.session.user = req.body;
            console.log('새로운 로그인');
            res.render('index.ejs', {user : req.session.user});
        }else{
            res.render('login.ejs');
        }
    })
})

module.exports = router;