const express=require('express');
const app=express();

const bodyParser=require('body-parser');

const chatFacebookRoutes=require('./routes/chatFacebookRoutes');

let port=process.env.PORT || 8080;

app.use(bodyParser.json());

app.get('/',function (req,res) {
   res.send('hello world');
});

app.use(chatFacebookRoutes);

app.listen(port,()=>{
   console.log(`app is running ${port}`); 
});