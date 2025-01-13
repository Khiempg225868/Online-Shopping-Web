const Role = require("../../models/role.model")
const systemConfig = require("../../config/system");
//[GET] /admin/roles
module.exports.index = async (req, res) => {
    let find ={
        deleted: false
    };
    const records = await Role.find(find);
    res.render("admin/pages/roles/index.pug",{
        pageTitle: "Trang nhóm quyền",
        records: records
    });
};
//[GET] /admin/roles/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create.pug",{
        pageTitle: "Thêm mới nhóm quyền",
    });
};
//[POST] /admin/roles/create
module.exports.createPost = async (req, res) => {
    const record = new Role(req.body);
    await record.save();
    res.redirect(`${systemConfig.prefixAdmin}/roles`)
};
//[POST] /admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        let find = {
              _id: id,
            deleted: false
        };
          
        const data = await Role.findOne(find);
        res.render("admin/pages/roles/edit",{
            pageTitle: "Sửa nhóm quyền",
            data: data
        })
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/roles`)
    }
};
//[PATCH] /admin/roles/editPatch/:id
module.exports.editPatch = async (req, res) => {
    try
    {
        const id = req.params.id;
        const result = await Role.updateOne({_id: id}, req.body);
        if(result.modifiedCount === 0){
            req.flash("error", "Khong cap nhat duoc");
        } else{
            req.flash("success", 
            "cap nhat thanh cong"
            );
        }
        // req.flash("success", `Cap nhat thanh cong`);
    } catch (error) {
        console.log(error);
        req.flash("error", "Cap nhat nhom quyen that bai");
    }
    res.redirect(`${systemConfig.prefixAdmin}/roles`);
};
//[GET] /admin/roles/permissions
module.exports.permissions = async (req, res) => {
    let find = {
        deleted: false
    }
    const records = await Role.find(find);
    res.render("admin/pages/roles/permissions.pug",{
        pageTitle: "Phân Quyền",
        records: records
    });
};

//[PATCH] /admin/roles/editPatch/:id
module.exports.permissionsPatch = async (req, res) => {
    const permissions = JSON.parse(req.body.permissions);
    for (const item of permissions) {
        await Role.updateOne({_id: item.id}, {permissions: item.permissions});
    }
    req.flash("success", "Cap nhat phan quyen thanh cong");
    res.redirect("back");
};