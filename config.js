require('dotenv').config(); 

module.exports = {
    PORT: process.env.PORT,
    DB_HOST: process.env.HOST,
    DB_USER: process.env.USER,    
    DB_PASSWORD: process.env.PASSWORD,
    DB_NAME: process.env.DB,
    MAIL: process.env.MAIL,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD
}