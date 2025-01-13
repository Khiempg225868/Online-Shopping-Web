const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const md5 = require("md5");
const generateHelper = require("../../helpers/generate")
const ForgotPassword = require("../../models/forgot-password.model")
const sendMailHelper = require("../../helpers/sendMail");
const SendmailTransport = require("nodemailer/lib/sendmail-transport");
//[GET] /user/register
module.exports.register = async (req, res) => {
    res.render("client/pages/user/register", {
        pageTitle: "Đăng ký",
    })
}
//[POST] /user/register
module.exports.registerPost = async (req, res) => {
    console.log(req.body);
    const existEmail = await User.findOne({
        email: req.body.email
    })
    if(existEmail){
        req.flash("error", "Email đã tồn tại");
        res.redirect("back");
        return;
    } 
    req.body.password = md5(req.body.password);
    const user = new User(req.body);
    await user.save();
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/");
}
//[GET] /user/login
module.exports.login = async (req, res) => {
    res.render("client/pages/user/login", {
        pageTitle: "Đăng nhập tài khoản",
    })
}
//[POST] /user/loginPost
module.exports.loginPost = async (req, res) => {
    const email =req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
        email: email,
        deleted: false
    });
    if(!user) {
        req.flash("error", "Email không tồn tại");
        res.redirect("back");
        return;
    }
    if(md5(password) !== user.password) {
        req.flash("error", "Mật khẩu không chính xác");
        res.redirect("back");
        return;
    }
    if(user.status === "inactive") {
        req.flash("error", "Tài khoản đã bị khóa");
        res.redirect("back");
        return;
    }
    const cart = await Cart.findOne({
        user_id: user.id
    });
    if(cart) {
        res.cookie("cartId",cart.id)
    } else {
        await Cart.updateOne({
        _id: req.cookies.cartId
        },{
            user_id: user.id
        })
    }
   
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/");
}
//[GET] /user/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    res.clearCookie("cartId")
    res.redirect("/");
}
//[GET] /user/password/forgotPassword
module.exports.forgotPassword = async (req, res) => {
    res.render("client/pages/user/forgot-password", {
        pageTitle: "Quên mật khẩu",
    })
}
//[POST] /user/password/forgotPassword
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;
    const user = await User.findOne({
        email: email,
        deleted: false
    });
    if(!user) {
        req.flash("error","Email không tồn tại!")
        res.redirect("back");
        return;
    }
    // Lưu thông tin vào DB
    const otp = generateHelper.generateRandomNumber(8);
    const objectForgotPassword = {
        email: email,
        otp: otp,
        expiresAt: Date.now()
    };
    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();
    // Nếu tồn tại Email thì gửi mã OTP qua Email
    const subject = "Mã OTP xác minh"
    const html = `Mã OTP để lấy lại mật khẩu là <b>${otp}</b>. Thời hạn sử dụng là 3 phút.`;
    sendMailHelper.sendMail(email, subject, html);
    res.redirect(`/user/password/otp?email=${email}`);
}
//[GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;
    res.render("client/pages/user/otp-password", {
        pageTitle: "Nhập mã OTP",
        email: email,
    });
}
//[POST] /user/password/otpPasswordPost
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;
    console.log(email);
    console.log(otp);
    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    })
    console.log(result)
    if(!result) {
        req.flash("error", "OTP không hợp lệ!")
        res.redirect("back");
        return;
    }
    const user = await User.findOne({
        email: email
    });
    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/user/password/reset");
}
//[GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("client/pages/user/reset-password", {
        pageTitle: "Đổi mật khẩu",
    });
};

//[POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const tokenUser = req.cookies.tokenUser;
    await User.updateOne({
        tokenUser: tokenUser,
    },{
        password: md5(password),
    })
    res.redirect("/");
};
//[GET] /user/info
module.exports.info = async (req,res) =>{
    res.render("client/pages/user/info", {
        pageTilte: "Thông tin tài khoản",
    })
}
