const UserRouter = require("./userRoute");
const ProductRouter = require("./productRoute");
const UnitRouter = require("./unitRoute");
const CategoryRouter = require("./categoryRoute");
const WarehouseManage = require('./warehouseManageRoute');

const CustomerRoute = require('./customerRoute');
const ServiceTicketRoute = require('./serviceTicketRoute');
const ServiceTypeRoute = require('./serviceTypeRoute');
const SaleInvoiceRoute = require('./saleInvoiceRoute');
const ProviderRoute = require ('./providerRoute');
const PurchaseOrder = require('./purchaseRoute');
const ChatBotRouter = require('./chatbotapi');


const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/unit", UnitRouter);
  app.use("/api/category", CategoryRouter);
  app.use('/api/warehouse', WarehouseManage);
  app.use("/api/customers", CustomerRoute);
  app.use("/api/services", ServiceTicketRoute);
  app.use("/api/service-types", ServiceTypeRoute);
  app.use('/api/provider', ProviderRoute);
  app.use('/api/purchase', PurchaseOrder);
  app.use("/api/sale", SaleInvoiceRoute);
  app.use("/api/chatbot", ChatBotRouter);
};

module.exports = routes;