const express = require("express")
const port = process.env.PORT

const app = express()

app.listen(port, () => console.log("app is running at port ", port))