import express from "express";
import { Router } from "express";
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Simulación de base de datos
const products = [];

// Rutas para el manejo de productos
const routerProducts = Router();

// Listar todos los productos
routerProducts.get("/", (req, res) => {
  const { limit } = req.query;

  const productsSliced = limit ? products.slice(0, limit) : products;

  res.json(productsSliced);
});

// Traer un producto por su id
routerProducts.get("/:pid", (req, res) => {
  const { pid } = req.params;

  const product = products.find((p) => p.id == pid);

  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(product);
});

// Agregar un producto
routerProducts.post("/", (req, res) => {
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: "Todos los campos son obligatorios, excepto thumbnails" });
  }

  const newProduct = {
    id: uuidv4(),
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  products.push(newProduct);

  res.json({ message: "Producto creado exitosamente", product: newProduct });
});

// Actualizar un producto
routerProducts.put("/:pid", (req, res) => {
  const { pid } = req.params;

  const { title, description, code, price, status, stock, category, thumbnails } = req.body;

  const productIndex = products.findIndex((p) => p.id == pid);

  if (productIndex < 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const productUpdated = {
    ...products[productIndex],
    title: title ?? products[productIndex].title,
    description: description ?? products[productIndex].description,
    code: code ?? products[productIndex].code,
    price: price ?? products[productIndex].price,
    status: status ?? products[productIndex].status,
    stock: stock ?? products[productIndex].stock,
    category: category ?? products[productIndex].category,
    thumbnails: thumbnails ?? products[productIndex].thumbnails,
  };

  products[productIndex] = productUpdated;

  res.json({ message: "Producto actualizado exitosamente", product: productUpdated });
});

// Eliminar un producto
routerProducts.delete("/:pid", (req, res) => {
  const { pid } = req.params;

  const productIndex = products.findIndex((p) => p.id == pid);

  if (productIndex < 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  products.splice(productIndex, 1);

  res.json({ message: "Error"});
})