import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const router = Router();

const PRODUCTS_FILE_PATH = './productos.json';
const CARTS_FILE_PATH = './cart.json';

// Obtener todos los productos 
router.get('/', async (req, res) => {
  const products = JSON.parse(await fs.readFile(PRODUCTS_FILE_PATH));
  res.json(products);
});

// Producto segun su id
router.get('/:id', async (req, res) => {
  const products = JSON.parse(await fs.readFile(PRODUCTS_FILE_PATH));
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Publicar nuevo producto
router.post('/', async (req, res) => {
  const products = JSON.parse(await fs.readFile(PRODUCTS_FILE_PATH));
  const newProduct = req.body;
  newProduct.id = uuidv4();
  products.push(newProduct);
  await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products));
  res.json(newProduct);
});

// Eliminar un solo pruducto por id
router.delete('/:id', async (req, res) => {
  let products = JSON.parse(await fs.readFile(PRODUCTS_FILE_PATH));
  const deletedProduct = products.find(p => p.id == req.params.id);
  products = products.filter(p => p.id != req.params.id);
  await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products));
  res.json(deletedProduct);
});

// Actualizar producto segun su id
router.put('/:id', async (req, res) => {
  let products = JSON.parse(await fs.readFile(PRODUCTS_FILE_PATH));
  const index = products.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, id: req.params.id };
    await fs.writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products));
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// Metodo post para comprar productos
router.post('/buy', async (req, res) => {
  try {
    const carts = JSON.parse(await fs.readFile(CARTS_FILE_PATH));
    const products = JSON.parse(await fs.readFile(PRODUCTS_FILE_PATH));

    const cartId = req.body.cartId;
    const cart = carts.find((c) => c.id == cartId);

    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const cartProducts = cart.products.map((cp) => {
      const product = products.find((p) => p.id == cp.productId);

      if (!product) {
        return null;
      }

      if (product.stock < cp.quantity) {
        return {
          ...product,
          quantity: cp.quantity,
          error: "Producto fuera de stock",
        };
      }

      product.stock -= cp.quantity;

      return {
        ...product,
        quantity: cp.quantity,
      };
    });

    const validProducts = cartProducts.filter((p) => p);

    if (validProducts.length < cartProducts.length) {
      await fs.writeFile(CARTS_FILE_PATH, JSON.stringify(carts));
      return res.status(400).json({
        error: "Uno o más productos están fuera de stock",
        products: validProducts,
      });
    }

    // Agregar productos nuevos comprados al carrito
    const newCart = {
      id: uuidv4(),
      products: [],
    };
    
    for (let i = 0; i < cartProducts.length; i++) {
      const product = cartProducts[i];
      const cartProduct = cart.products[i];
      const purchasedProduct = {
        ...product,
        quantity: cartProduct.quantity
      };
      newCart.products.push(purchasedProduct);
    }
    
    // reemplacar carrito nuevo con el viejo
    const cartIndex = carts.findIndex((c) => c.id == cartId);
    carts[cartIndex] = newCart;

    // archivar los productos
    fs.writeFileSync(CARTS_FILE_PATH, JSON.stringify(carts));

    // Respuesta de exito
    return res.status(200).json({
      message: "Compra exitosa",
      cart: newCart
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router ;