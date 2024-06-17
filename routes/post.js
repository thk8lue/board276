//게시에 해당하는 라우터들만 모아놓을 곳
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

router.get('/list', function(req, res){
    // res.send('데이터 베이스를 조회합니다.');
    // //query(): SQL 쿼리를 사용할 수 있게 해줌
    // conn.query("select * from post", function(err, rows, fields){
    // //콜백함수의 매개변수로 응답이 들어옴.
    //     if(err) throw err;
    //     console.log(rows);
    // })
    mydb.collection('post').find().toArray().then(result => {
        console.log(result);
        res.render('list.ejs', {data : result});
    })
    //res.sendFile(__dirname + '/list.html');
    
})

module.exports = router;