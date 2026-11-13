import { Request, Response } from "express";
import { getProducts, createProduct } from "../services/productServices";

//GET /api/products?page=1&limit=10&search=shirt
export const listProducts = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;

  const result = await getProducts(page, limit, search);
  res.status(200).json(result);
};

//POST /api/prodact (Admin only)

export const addProduct = async (req: Request, res: Response) => {
  const { name, price, stock } = req.body ?? {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof price !== "number" ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    res.status(400).json({
      message: "name (text), price (number) and stock (integer) are required",
    });
    return;
  }
  const product = await createProduct(name.trim(), price, stock);
  res.status(201).json(product);
};
