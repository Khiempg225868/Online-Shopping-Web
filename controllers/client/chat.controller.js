const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const chatSocket = require("../../sockets/client/chat.socket");
//[GET] /chat
module.exports.index = async (req,res) => {
    const userId = res.locals.user.id;
    const fullName = res.locals.user.fullName;
    // SocketIO
    chatSocket(req, res);
    // End SocketIo

    // Lấy DATA từ DataBase
    const chats =  await Chat.find({
        deleted: false
    })
    for(const chat of chats) {
        const infoUser = await User.findOne({
            _id: chat.user_id
        }).select("fullName");
        chat.infoUser = infoUser;
    }
    // End Lấy DATA từ DataBase
    res.render("client/pages/chat/index",{
        pageTitle: "Chat",
        chats: chats
    })
}