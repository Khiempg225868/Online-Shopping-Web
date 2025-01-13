const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require("../../models/account.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const { query } = require("express");
const systemConfig = require("../../config/system");
//[GET] /admin/products
module.exports.index = async (req, res) => {
  const filterStatus = filterStatusHelper(req.query);

  let find = {
    deleted: false,
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  // Tìm kiếm

  const objectSearch = searchHelper(req.query);

  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }

  //Pagination

  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItem: 4,
    },
    req.query,
    countProducts
  );
  //sort
  let sort = {};
  if(req.query.sortKey && req.query.sortValue){
    sort[req.query.sortKey] = req.query.sortValue;
  } else {
    sort.position = "desc";
  }
  //end sort
  const products = await Product.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  for (const product of products) {
    const user = await Account.findOne({
      _id: product.createBy.account_id
    });
    if(user) {
      product.accountFullname = user.fullName
    }
    const updatedBy = product.updatedBy[product.updatedBy.length-1];
    if(updatedBy) {
        const userUpdated = await Account.findOne({
        _id: updatedBy.account_id
      });
      updatedBy.accountFullname = userUpdated.fullName;
    }

  }
  res.render("admin/pages/products/index.pug", {
    pageTitle: "Danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[GET] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }
  await Product.updateOne({ _id: id }, { 
    status: status,
    $push: { updatedBy: updatedBy } 
  });
  req.flash("success", "Cập nhật trạng thái thành công!");
  res.redirect("back");
};
//[GET] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  const updatedBy = {
    account_id: res.locals.user.id,
    updatedAt: new Date()
  }
  switch (type) {
    case "active":
      await Product.updateMany({ _id: { $in: ids } }, { 
        status: "active",
        $push: { updatedBy: updatedBy }  
      });
      req.flash(
        "success",
        `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`
      );
      break;
    case "inactive":
      await Product.updateMany({ _id: { $in: ids } }, { 
        status: "inactive",
        $push: { updatedBy: updatedBy }  
      });
      req.flash(
        "success",
        `Cập nhật trạng thái thành công ${ids.length} sản phẩm!`
      );
      break;
    case "delete-all":
      await Product.updateMany(
        { _id: { $in: ids } },
        {
          deleted: true,
          // deletedAt: new Date(),
          deletedBy:{
            account_id: res.locals.user.id,
            deletedAt: new Date(),
          }
        }
      );
      break;
    case "change-position":
      for (const item of ids) {
        let [id, position] = item.split("-");
        position = parseInt(position);
        await Product.updateOne(
          { _id: id },
          {
            position: position,
            $push: { updatedBy: updatedBy } 
          }
        );
      }
      break;
    default:
      break;
  }
};

//[GET] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne(
    { _id: id },
    {
      deleted: true,
      deletedBy:{
        account_id: res.locals.user.id,
        deletedAt: new Date(),
      }
    }
  );
  req.flash("success", `Đã xóa thành công sản phẩm!`);
  res.redirect("back");
};

//[GET] /admin/products/create
module.exports.create = async (req, res) => {
  find = {
    deleted: false,
  };
  function createTree(arr, parentId = ""){
    const tree = [];
    arr.forEach((item) => {
      if(item.parent_id === parentId) {
        const newItem = item;
        const children = createTree(arr, item.id);
        if(children.length > 0)
        {
          newItem.children = children;
        }
        tree.push(newItem);
      }
    });
    return tree;
  }
  const Category = await ProductCategory.find(find);
  const newCategory = createTree(Category);
  res.render("admin/pages/products/create", {
    pageTitle: "Thêm mới sản phẩm",
    Category: newCategory
  });
};

//[POST] /admin/products/create
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price);
  req.body.discountPecentage = parseInt(req.body.discountPecentage);
  req.body.stock = parseInt(req.body.stock);
  if (req.body.position == "") {
    const countProducts = await Product.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  req.body.createBy = {
    account_id: res.locals.user.id
  };
  const product = new Product(req.body);
  await product.save();

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};
//[PATCH] /admin/products/edit/:id
module.exports.edit= async (req,res) => {
  try{
      const find = {
      deleted: false,
      _id: req.params.id
    };
    function createTree(arr, parentId = ""){
      const tree = [];
      arr.forEach((item) => {
        if(item.parent_id === parentId) {
          const newItem = item;
          const children = createTree(arr, item.id);
          if(children.length > 0)
          {
            newItem.children = children;
          }
          tree.push(newItem);
        }
      });
      return tree;
    }
    const Category = await ProductCategory.find({
      deleted: false,
    });
    const newCategory = createTree(Category);
    const product = await Product.findOne(find);
    res.render("admin/pages/products/edit" ,{
      pageTitle: "Chỉnh sửa sản phẩm",
      product: product,
      Category: newCategory
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  };
}
//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req,res) => {
  const id = req.params.id;
  req.body.price = parseInt(req.body.price);
  req.body.discountPecentage = parseInt(req.body.discountPecentage);
  req.body.stock = parseInt(req.body.stock);
  req.body.position = parseInt(req.body.position);

  if(req.file){
      req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  try {
    const updatedBy = {
      account_id: res.locals.user.id,
      updatedAt: new Date()
    }
    await Product.updateOne({ _id: id },{
      ...req.body,
      $push: { updatedBy: updatedBy }
    });
    req.flash("success", `Cập nhật thành công!`);
  } catch (error) {
    req.flash("success", `Cập nhật thất bại!`);
  }

  res.redirect(`${systemConfig.prefixAdmin}/products`);
};
//[PATCH] /admin/products/detail/:id
module.exports.detail= async (req,res) => {
  try{
      const find = {
      deleted: false,
      _id: req.params.id
    };
    const product = await Product.findOne(find);
    res.render("admin/pages/products/detail" ,{
      pageTitle: product.title,
      product: product,
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products`);
  };
}