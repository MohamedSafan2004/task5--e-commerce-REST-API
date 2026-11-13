import { prisma } from "../prisma";
import { Prisma } from "../generated/prisma/client";

// Get products with pagination and optional name search

export const getProducts = async (
  page: number,
  limit: number,
  search?: string,
) => {
  const where: Prisma.ProductWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
};

//create product
export const createProduct = async (
  name: string,
  price: number,
  stock: number,
) => {
  return prisma.product.create({ data: { name, price, stock } });
};
