const ProductCategory = require("../../models/product-category.model");
const systemConfig = require("../../config/system");
//[GET] /admin/products-category
module.exports.index = async (req, res) => {
  let find = {
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
  const records = await ProductCategory.find(find);
  const newRecords = createTree(records);
  res.render("admin/pages/products-category/index.pug", {
    pageTitle: "Danh mục sản phẩm",
    records: newRecords
  });
};
//[GET] /admin/products-category/create
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
  const records = await ProductCategory.find(find);
  const newRecords = createTree(records);
  res.render("admin/pages/products-category/create.pug", {
    pageTitle: "Tạo danh mục sản phẩm",
    records: newRecords
  });
};
//[POST] /admin/products-category/createPost
module.exports.createPost = async (req, res) => {
  if (req.body.position == "") {
    const countProducts = await ProductCategory.countDocuments();
    req.body.position = countProducts + 1;
  } else {
    req.body.position = parseInt(req.body.position);
  }
  const record = new ProductCategory(req.body);
  await record.save();
  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};
//[GET] /admin/products-category/edit
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await ProductCategory.findOne({
      _id: id,
      deleted: false
    });
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
    const records = await ProductCategory.find(find);
    const newRecords = createTree(records);
    console.log(newRecords);
    res.render("admin/pages/products-category/edit.pug", {
      pageTitle: "Chỉnh sửa danh mục sản phẩm",
      data: data,
      records: newRecords
    });
  } catch (error) {
    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
  }
 
};
//[PATCH] /admin/products-category/edit/:id
module.exports.editPatch = async (req,res) => {
  const id = req.params.id
  req.body.position = parseInt(req.body.position);
  try {
    await ProductCategory.updateOne({_id: id}, req.body);
    req.flash("Updated Successfull")
  } catch (error) {
    req.flash("Updated Error")
  }
  res.redirect(`${systemConfig.prefixAdmin}/products-category`);
};
//[GET] /admin/products-category/detail
module.exports.detail = async (req,res) => {
  const find = {
    deleted: false,
    _id: req.params.id
  };
  const product = await ProductCategory.findOne(find);
  res.render("admin/pages/products-category/detail" ,{
    pageTitle: product.title,
    product: product
  });
};