export interface PrismaDelegate<FindManyArgs = any, CountArgs = any, Entity = any> {
  findMany(args: FindManyArgs): Promise<Entity[]>;
  count(args: CountArgs): Promise<number>;
}
