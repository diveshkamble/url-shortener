require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const validurl = require("valid-url");
const { Deta } = require("deta");
const deta = Deta(process.env.DETA_KEY);
const db = deta.Base("shorturl");

app.use(cors());

app.use(express.json());

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/shorturl/:shorturl?", async function (req, res) {
  const url_id = req.params.shorturl;
  const get_url = await db.get(url_id);
  res.redirect(get_url.url);
});

// Your first API endpoint
app.post("/api/shorturl", async function (req, res) {
  const url = req.body.url;
  //const urlHash = crypto.createHash("md5").update(url).digest("hex");
  if (!validurl.isUri(url)) return res.json({ error: "Invalid URL" });
  else {
    const toInsert = { url };
    const exists = await db.fetch({ url }, { limit: 1 });
    console.log(exists);
    if (exists)
      res.send(
        JSON.stringify({
          original_url: exists.items[0].url,
          short_url: exists.items[0].key,
        })
      );
    else {
      const insertedURL = await db.put(toInsert);
      res.send(
        JSON.stringify({ original_url: url, short_url: insertedURL.key })
      );
    }
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
