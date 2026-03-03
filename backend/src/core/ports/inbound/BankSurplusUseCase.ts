import { BankSurplusBodyDto } from '../../application/dto/BankingDTO';

export interface BankSurplusOutput {
    bankedAmount: number;
    remainingSurplus: number;
}

export interface BankSurplusUseCase {
    execute(input: BankSurplusBodyDto): Promise<BankSurplusOutput>;
}
