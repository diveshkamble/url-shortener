require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const MongoClient  = require('mongodb').MongoClient;
const dbURL = process.env.DB_URI;
const dbName = 'UrlShort';
const urlRegex = new RegExp(/https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
const shortRegex = new RegExp(/([0-9]){5}/gi);



app.use(cors());

//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



app.get('/api/shorturl/:shorturl',async function(req,res) {
  const shorturl = await req.params.shorturl;
  console.log(shorturl);

    const shortTest = shortRegex.test(shorturl);

    if (shortTest)
   {
  const data1 = await getOriginalUrl(shorturl)




  if(data1==null)
  {
res.json({"error": "No short URL found for the given input"})
}
else
{
  res.redirect(301,data1.url);
}

    }
else
{

res.json({error:"Wrong Format"})
}
})


// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  let test = urlRegex.test(req.body.url);
  console.log(req.body.url);
  if(test)
  {
    const data = await checkUrl(req.body.url);
    if(data){

      res.json({original_url:data.url,short_url:data.short})
    }
    else
    {
   
      let short = Math.floor(Math.random()*10000+1);
      while(await checkShortUrl(short))
      {
      short = Math.floor(Math.random()*10000+1);
      }
      const insertResult = await insertURL(req.body.url,short);
      if (insertResult)
      res.json({original_url:req.body.url,short_url:short});
    }

    
  }
  else
  {
    res.json({"error":"Invalid Hostname"})
  }
   
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});



 async function checkUrl(url){
 let client = new MongoClient(dbURL,{ useNewUrlParser: true, useUnifiedTopology: true  })
let conn = await client.connect()
  try {


    const db = conn.db(dbName);


    let r = await db.collection('urlmain').findOne({"url":url});
     conn.close();
    return r;

    
  } catch (err) {
    console.log(err.stack);
  }

  // Close connection
 
}


async function checkShortUrl(short){

   let client = new MongoClient(dbURL,{ useNewUrlParser: true, useUnifiedTopology: true  })

let conn = await client.connect()

  try {
 
    const db = conn.db(dbName);

  
    let r = await db.collection('urlmain').findOne({"short":short});

   if (r===null)
   {
  
   return false;
   conn.close();
   }
   else
   {

   return true;
   conn.close();
   }

    
  } catch (err) {
    console.log(err.stack);
  }

  // Close connection
  

}


async function insertURL(url,short){
  const client = new MongoClient(dbURL,{ useNewUrlParser: true, useUnifiedTopology: true  })
const conn = await client.connect()
  try {
       const db = conn.db(dbName);
 
    let r = await db.collection('urlmain').insertOne({"url":url,"short":short,"date":await new Date()});
   //console.log(r);
  if(r.insertedCount!==0)
  {  // Close connection
  conn.close();
    return true;
  }

  else
  {  // Close connection
  conn.close();
    return false;
  }
    
  } catch (err) {
    console.log(err.stack);
  }


}



async function getOriginalUrl(short){

   const client = new MongoClient(dbURL,{ useNewUrlParser: true, useUnifiedTopology: true  });

let conn = await client.connect();

  try {
    const db =conn.db(dbName);

  
    let r = await db.collection('urlmain').findOne({"short":parseInt(short)});

      conn.close();
   return await r;
   }

    
   catch (err) {
    console.log(err.stack);
  }
  

}

 