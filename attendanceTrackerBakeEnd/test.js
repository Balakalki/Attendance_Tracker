const app = require('./index');

const port = process.env.PORT;

app.listen(port, () => {console.log("server start on port ", port)});