import { CreatePoolBodyDto, JoinPoolBodyDto } from '../../application/dto/PoolsDTO';

export interface PoolMemberOutput {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
}

export interface PoolOutput {
    poolId: string;
    year: number;
    members: PoolMemberOutput[];
}

export interface CreatePoolUseCase {
    execute(input: CreatePoolBodyDto, allowedShipIds: string[]): Promise<PoolOutput>;
}

export interface GetPoolUseCase {
    execute(poolId: string): Promise<PoolOutput>;
}

export interface JoinPoolUseCase {
    execute(poolId: string, input: JoinPoolBodyDto, allowedShipIds: string[]): Promise<PoolOutput>;
}

export interface LeavePoolUseCase {
    execute(poolId: string, shipId: string, allowedShipIds: string[]): Promise<PoolOutput>;
}
