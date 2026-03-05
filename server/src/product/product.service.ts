import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, ProductQueryDto, ProductResponseDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListResponseType, ResponseType } from '../common/types/response.type';
import * as fs from 'fs';
import * as path from 'path';
import { PaginateQuery } from '../common/classes/paginate-query';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new product in the database with image uploads.
   * @param data - The data required to create a product.
   * @param files - Array of uploaded image files
   * @returns A response object containing the created product or an error message.
   */
  async createProduct(
    data: CreateProductDto,
    files: Express.Multer.File[],
  ): Promise<ResponseType<ProductResponseDto>> {
    try {
      const { name, version, shortDescription, longDescription, inStock, price } = data;
      let parsedPrice: { reseller: number; RRP: number; discount: number };
      parsedPrice = JSON.parse(price);
      if (!parsedPrice.reseller || !parsedPrice.RRP) {
        throw new BadRequestException(
          'Price must include reseller, RRP, and optional discount field.',
        );
      }

      // upload images
      const images =
        files && files.length > 0
          ? files.map((file) => ({
              url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`,
              alt: file.originalname,
            }))
          : [];

      const product = await this.prismaService.product.create({
        data: {
          name,
          version: version || null,
          shortDescription: shortDescription || null,
          longDescription: longDescription || null,
          inStock: inStock === 'true',
          price: parsedPrice,
          images,
        },
      });

      return {
        success: true,
        error: null,
        data: product as ProductResponseDto,
      };
    } catch (error) {
      if (files && files.length > 0) {
        this.deleteUploadedFiles(files.map((f) => f.filename));
      }
      throw error;
    }
  }

  /**
   * Updates an existing product with optional image uploads.
   * @param id - The product ID to update
   * @param data - The data to update
   * @param files - Array of new uploaded image files
   * @returns A response object containing the updated product or an error message.
   */
  async updateProduct(
    id: string,
    data: UpdateProductDto,
    files?: Express.Multer.File[],
  ): Promise<ResponseType<ProductResponseDto>> {
    try {
      const existingProduct = await this.prismaService.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      let parsedPrice: { reseller: number; RRP: number; discount: number } | undefined;
      if (data.price) {
        parsedPrice = JSON.parse(data.price);
      }

      let updatedImages = [...existingProduct.images];
      console.log('data.keepImages', data.keepImages);

      // If keepImages is provided, filter to only keep specified images
      if (data.keepImages) {
        const keepImageUrls = Array.isArray(data.keepImages)
          ? JSON.parse(data.keepImages)
          : data.keepImages;

        const imagesToDelete = existingProduct.images.filter(
          (img) => !keepImageUrls.includes(img.url),
        );

        // Delete removed images from disk
        imagesToDelete.forEach((img) => {
          const filename = path.basename(img.url);
          this.deleteUploadedFiles([filename]);
        });

        updatedImages = existingProduct.images.filter((img) => keepImageUrls.includes(img.url));
      }

      // Add new uploaded images
      if (files && files.length > 0) {
        const newImages = files.map((file) => ({
          url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`,
          alt: file.originalname,
        }));
        updatedImages = [...updatedImages, ...newImages];
      }

      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.version !== undefined) updateData.version = data.version;
      if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
      if (data.longDescription !== undefined) updateData.longDescription = data.longDescription;
      if (data.inStock !== undefined) {
        updateData.inStock = data.inStock === 'true';
      }
      if (parsedPrice) updateData.price = parsedPrice;
      if (data.keepImages || (files && files.length > 0)) {
        updateData.images = updatedImages;
      }

      // Update product
      const updatedProduct = await this.prismaService.product.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        error: null,
        data: updatedProduct as ProductResponseDto,
      };
    } catch (error) {
      if (files && files.length > 0) {
        this.deleteUploadedFiles(files.map((f) => f.filename));
      }
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<ResponseType<ProductResponseDto>> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        reviews: { select: { rating: true } },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const ratings = product.reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    return {
      success: true,
      error: null,
      data: { ...product, averageRating } as ProductResponseDto,
    };
  }

  /**
   * Get all products with optional filters
   */
  async getProducts(query: ProductQueryDto): Promise<ListResponseType<ProductResponseDto>> {
    const { page = 1, limit = 10, inStock, search, toRated } = query;
    const where: any = {};
    const include = {
      reviews: {
        select: { rating: true },
      },
    };
    let orderBy: any = { createdAt: 'desc' };
    if (toRated) {
      orderBy = {
        reviews: {
          _count: 'desc',
        },
      };
    }

    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { longDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const paginate = new PaginateQuery(
      // @ts-ignore
      this.prismaService.product,
      page,
      limit,
      where,
      include,
      mapProductToResponseDto,
      orderBy,
    );
    return paginate.paginate();
  }

  /**
   * Delete a product and its associated images
   */
  async deleteProduct(id: string): Promise<ResponseType<{ message: string }>> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Delete associated images from disk
    if (product.images && product.images.length > 0) {
      const filenames = product.images.map((img) => path.basename(img.url));
      this.deleteUploadedFiles(filenames);
    }

    // Delete product from database
    await this.prismaService.product.delete({
      where: { id },
    });

    return {
      success: true,
      error: null,
      data: { message: `Product ${id} deleted successfully` },
    };
  }

  /**
   * Helper method to delete uploaded files from disk
   */
  private deleteUploadedFiles(filenames: string[]): void {
    filenames.forEach((filename) => {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete file ${filename}:`, error);
        }
      }
    });
  }
}

const mapProductToResponseDto = (
  products: ({
    reviews: {
      rating: number;
    }[];
  } & ProductResponseDto)[],
): ProductResponseDto[] => {
  return products.map((product) => {
    const ratings = product.reviews.map((r) => r.rating);

    const averageRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return {
      id: product.id,
      name: product.name,
      version: product.version,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      inStock: product.inStock,
      price: product.price,
      images: product.images,
      averageRating,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  });
};
