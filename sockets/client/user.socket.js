const User = require("../../models/user.model");
module.exports = (res) => {
    _io.once('connection', (socket) => {
        // Chức năng gửi yêu cầu
        socket.on("CLIENT_ADD_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // console.log(userId);   //id cua B
            // console.log(myUserId); //id cua A
            //Them id cua A vao acceptsFriend cua B
            const existIDAinB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            })
            if(!existIDAinB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: { acceptFriends: myUserId }
                });
            }
            //them id cua B vao requestFriend cua A
            const existIDBinA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            })
            if(!existIDBinA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: { requestFriends: userId }
                });
            }
        });
        // Chức năng hủy gửi yêu cầu
        socket.on("CLIENT_CANCEL_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // console.log(userId);   //id cua B
            // console.log(myUserId); //id cua A
            //Xoa id cua A trong acceptsFriend cua B
            const existIDAinB = await User.findOne({
                _id: userId,
                acceptFriends: myUserId
            })
            if(existIDAinB) {
                await User.updateOne({
                    _id: userId
                }, {
                    $pull: { acceptFriends: myUserId }
                });
            }
            //Xoa id cua B trong requestFriend cua A
            const existIDBinA = await User.findOne({
                _id: myUserId,
                requestFriends: userId
            })
            if(existIDBinA) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $pull: { requestFriends: userId }
                });
            }
        });
        // Chức năng từ chối kết bạn
        socket.on("CLIENT_REFUSE_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // console.log(userId);   //id cua A
            // console.log(myUserId); //id cua B
            //Xoa id cua A trong acceptsFriend cua B
            const existIDAinB = await User.findOne({
                _id: myUserId,
                acceptFriends: userId
            })
            if(existIDAinB) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $pull: { acceptFriends: userId }
                });
            }
            //Xoa id cua B trong requestFriend cua A
            const existIDBinA = await User.findOne({
                _id: userId,
                requestFriends: myUserId
            })
            if(existIDBinA) {
                await User.updateOne({
                    _id: userId
                }, {
                    $pull: { requestFriends: myUserId }
                });
            }
        });
        // Chức năng đồng ý kết bạn
        socket.on("CLIENT_ACCEPT_FRIEND", async (userId) => {
            const myUserId = res.locals.user.id;
            // console.log(userId);   //id cua A
            // console.log(myUserId); //id cua B

            // Thêm {user_id, room_chat_id} của A vào friendList của B
            // Xoa id cua A trong acceptsFriend cua B
            const existIDAinB = await User.findOne({
                _id: myUserId,
                acceptFriends: userId
            })
            if(existIDAinB) {
                await User.updateOne({
                    _id: myUserId
                }, {
                    $push: { 
                        friendList: {
                            user_id: userId,
                            room_chat_id: ""
                        }
                     },
                    $pull: { acceptFriends: userId }
                });
            }
            // Thêm {user_id, room_chat_id} của B vào friendList của A
            // Xoa id cua B trong requestFriend cua A
            const existIDBinA = await User.findOne({
                _id: userId,
                requestFriends: myUserId
            })
            if(existIDBinA) {
                await User.updateOne({
                    _id: userId
                }, {
                    $push: { 
                        friendList: {
                            user_id: myUserId,
                            room_chat_id: ""
                        }
                     },
                    $pull: { requestFriends: myUserId }
                });
            }
        });
    })
}