import express from "express";
import routerCarts from "./routes/carritoRoutes.js"
import routerProducts from "./routes/productosRoutes.js"

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/carts", routerCarts);
app.use("/api/products", routerProducts);

// Iniciar servidor
app.listen(3000, () => { console.log('Servidor iniciado en puerto 3000');});