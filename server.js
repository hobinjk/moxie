// Simple server with correct content-type from stackoverflow

import express from 'express';
const app = express();

express.static.mime.define({'application/wasm': ['wasm']});

app.use(express.static('./dist'));
app.listen(8081);
