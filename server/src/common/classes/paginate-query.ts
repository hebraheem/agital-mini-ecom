import { ListResponseType } from '../types/response.type';
import { PrismaDelegate } from '../types/prisma-delegate';

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
    });

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
