const dashboardRoutes = require("./dashboard.route.js");
const systemConfig = require("../../config/system.js");
const productRoutes = require("./product.route.js");
const productCategoryRoutes = require("./products-category.route.js");
const roleRoutes = require("./role.route.js");
const accountRoutes = require("./account.route.js");
const authRoutes = require("./auth.route.js");
const authMiddleWare = require("../../middlewares/admin/auth.middleware.js");
const myAccountRoutes = require("./my-account.route.js");
const settingGeneralRoutes = require("./setting.route.js");
module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(
    PATH_ADMIN + "/dashboard",
    authMiddleWare.requireAuth,
    dashboardRoutes
  );
  app.use(
    PATH_ADMIN + "/products", 
    authMiddleWare.requireAuth, 
    productRoutes
  );
  app.use(
    PATH_ADMIN + "/products-category",
    authMiddleWare.requireAuth,
    productCategoryRoutes
  );
  app.use(
    PATH_ADMIN + "/roles", 
    authMiddleWare.requireAuth,
    roleRoutes
  );
  app.use(PATH_ADMIN + "/accounts",
    authMiddleWare.requireAuth,
    accountRoutes
  );
  app.use(PATH_ADMIN + "/auth", authRoutes);
  app.use(PATH_ADMIN + "/my-account", authMiddleWare.requireAuth, myAccountRoutes);
  app.use(PATH_ADMIN + "/settings", authMiddleWare.requireAuth, settingGeneralRoutes);

};
