export interface ComputeCbInput {
    shipId: string;
    year: number;
}

export interface ComputeCbOutput {
    shipId: string;
    year: number;
    targetIntensity: number;
    actualIntensity: number;
    energyInScope: number;
    complianceBalance: number;
}

export interface ComputeComplianceBalanceUseCase {
    execute(input: ComputeCbInput): Promise<ComputeCbOutput>;
}
