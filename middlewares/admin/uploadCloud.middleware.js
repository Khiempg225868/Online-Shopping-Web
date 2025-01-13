const uploadToCloundinary = require("../../helpers/uploadToCloudinary")
module.exports.upload = async (req, res, next) => {
  if (req.file) {
    const link = await uploadToCloundinary(req.file.buffer);
    req.body[req.file.fieldname] = link;
  } 
  next();
}