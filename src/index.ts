import express from "express";
import route from "./routes/userRoute";
import productRoute from "./routes/productRoute";
import helmet from "helmet";
import cors from "cors";
import orderRoute from "./routes/orderRoute";
const app = express();
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", route);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.listen(3000, () => {
  console.log("server is Running");
});
