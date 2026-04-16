import { Result, ok, err } from "../types";

// Generic async wrapper — catches any error and returns a Result
export async function withResult<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const code = (e as any).statusCode ?? 500;
    return err(message, code);
  }
}

// Generic in-memory repository — demonstrates the generic class pattern.
// In production you would wrap Drizzle or Prisma queries here.
export class Repository<T extends { id: number }> {
  protected items: T[] = [];
  private nextId = 1;

  async findById(id: number): Promise<Result<T>> {
    return withResult(async () => {
      const item = this.items.find((i) => i.id === id);
      if (!item)
        throw Object.assign(new Error("Not found"), { statusCode: 404 });
      return item;
    });
  }

  async findAll(predicate?: (item: T) => boolean): Promise<Result<T[]>> {
    return withResult(async () =>
      predicate ? this.items.filter(predicate) : [...this.items],
    );
  }

  async create(data: Omit<T, "id">): Promise<Result<T>> {
    return withResult(async () => {
      const item = { id: this.nextId++, ...data } as T;
      this.items.push(item);
      return item;
    });
  }

  async update(id: number, data: Partial<Omit<T, "id">>): Promise<Result<T>> {
    return withResult(async () => {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1)
        throw Object.assign(new Error("Not found"), { statusCode: 404 });
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    });
  }

  async delete(id: number): Promise<Result<boolean>> {
    return withResult(async () => {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1)
        throw Object.assign(new Error("Not found"), { statusCode: 404 });
      this.items.splice(index, 1);
      return true;
    });
  }
}
