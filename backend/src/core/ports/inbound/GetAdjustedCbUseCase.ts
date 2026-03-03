import { ComputeCbQueryDto } from '../../application/dto/ComplianceDTO';

export interface AdjustedCbOutput {
    shipId: string;
    year: number;
    cbBefore: number;
    bankApplied: number;
    cbAfter: number;
}

export interface GetAdjustedCbUseCase {
    execute(input: ComputeCbQueryDto): Promise<AdjustedCbOutput>;
}
