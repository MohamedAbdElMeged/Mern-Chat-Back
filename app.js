const express = require('express');
const users = require('./users');
//const socket_client = require("socket.io-client")
const chats = require('./chats');

const app = express();
var cors = require('cors')

app.use(cors())
const io = require("socket.io")(5000, { cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.on("connection", socket => { 
      socket.on("chatnew", (arg) => {
          addMessage(arg)
          console.log(arg)
          socket.broadcast.emit("chatnew", arg)
      });
});

app.use(express.json())
app.listen(8000, ()=> console.log('server is running'))
app.get('/' , (req,res)=> {
    console.log(req)
    res.json(users)
})

app.post('/login',(req,res)=>{
    console.log(req.body)
const {uname , pass} = req.body
    const logggedIn = users.find(x=> x.uname == uname && x.pass== pass)
    
    if (logggedIn) {
          
        const token = logggedIn.pass+logggedIn.uname
        logggedIn.token = token
        return res.json({
            "message": "success",
            logggedIn
        })
    } 
})

const addMessage =(arg) => {
    const {message , chatId , token,messageType} = arg
    let filename='';
     if(messageType =="file") 
     {
         filename= arg.filename
     }
    const user = users.find(x=> x.token == token)
    const chat = chats.find(c=>c.id == chatId)
    const NewMessage = {
        sender: user.id,
        chatId,
        message: {
            type: messageType,
            message: message,
            filename
        }
    }

    chat.messages = [...chat.messages , NewMessage]
    return chat.messages

}