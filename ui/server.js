// Simple server with correct content-type from stackoverflow

const express = require('express');
const app = express();

express.static.mime.define({'application/wasm': ['wasm']});

app.use(express.static('./dist'));
app.listen(8081);
