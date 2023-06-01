import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const router = Router();

const CARTS_FILE_PATH = './carts.json';
const PRODUCTS_FILE_PATH = './productos.json';

// Ruta para crear un nuevo carrito
router.post('/', (req, res) => {
  try {
    const carts = JSON.parse(fs.readFileSync(CARTS_FILE_PATH));

    const newCart = {
      id: uuidv4(),
      products: [],
    };

    carts.push(newCart);

    fs.writeFileSync(CARTS_FILE_PATH, JSON.stringify(carts));

    res.json({ message: 'Carrito creado exitosamente', cart: newCart });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

// Ruta para listar los productos de un carrito
router.get('/:cid', (req, res) => {
  try {
    const carts = JSON.parse(fs.readFileSync(CARTS_FILE_PATH));
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE_PATH));

    const { cid } = req.params;
    const cart = carts.find((c) => c.id == cid);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const cartProducts = cart.products.map((cp) => {
      const product = products.find((p) => p.id == cp.productId);

      return {
        ...product,
        quantity: cp.quantity,
      };
    });

    res.json(cartProducts);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Error al listar los productos del carrito' });
  }
});

// Ruta para agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
  try {
    const carts = JSON.parse(fs.readFileSync(CARTS_FILE_PATH));

    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cartIndex = carts.findIndex((c) => c.id == cid);

    if (cartIndex < 0) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const cart = carts[cartIndex];

    const cartProductIndex = cart.products.findIndex((cp) => cp.productId == pid);

    if (cartProductIndex < 0) {
      cart.products.push({
        productId: pid,
        quantity: quantity || 1,
      });
    } else {
      cart.products[cartProductIndex].quantity += quantity || 1;
    }

    fs.writeFileSync(CARTS_FILE_PATH, JSON.stringify(carts));

    res.json({ message: 'Producto agregado al carrito exitosamente' });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  }
});

export default router;