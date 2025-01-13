const Product = require("../models/product.model");
module.exports = (objectPagination, query,coutProducts) => {
    if(query.page) {
        objectPagination.currentPage = parseInt(query.page);
    }

    objectPagination.skip = (objectPagination.currentPage-1)*objectPagination.limitItem;
    const totalPage = Math.ceil(coutProducts/objectPagination.limitItem);
    objectPagination.totalPage = totalPage;
    return objectPagination
}