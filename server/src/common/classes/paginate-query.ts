import { ListResponseType } from '../types/response.type';
import { PrismaDelegate } from '../types/prisma-delegate';
import { BadRequestException } from '@nestjs/common';

export class PaginateQuery<
  TResponse,
  TEntity,
  TDelegate extends PrismaDelegate<any, any, TEntity>,
> {
  constructor(
    private readonly prisma: TDelegate,
    private readonly page: number,
    private readonly limit: number,
    private readonly where?: Record<string, any>,
    private readonly include?: Record<string, any>,
    private readonly mapper?: (items: TEntity[]) => TResponse[],
    private readonly orderBy?: Record<string, any>,
  ) {}

  async paginate(): Promise<ListResponseType<TResponse>> {
    const skip = (this.page - 1) * this.limit;

    const total = await this.prisma.count({
      where: this.where,
    });

    const data = await this.prisma.findMany({
      skip,
      take: this.limit,
      where: this.where,
      include: this.include,
      orderBy: this.orderBy,
    });

    const pageOutOfBound = skip >= total && total > 0;
    if (pageOutOfBound) {
      throw new BadRequestException('Page number exceeds total pages available');
    }
    return {
      success: true,
      error: null,
      data: this.mapper ? this.mapper(data) : (data as unknown as TResponse[]),
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: this.limit,
        totalPages: Math.ceil(total / this.limit),
        currentPage: this.page,
      },
    };
  }
}
