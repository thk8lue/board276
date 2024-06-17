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

router.get('/enter', function(req, res){
    //res.sendFile(__dirname + '/enter.html');
    res.render('enter.ejs');
})



module.exports = router;