import { ApplyBankedBodyDto } from '../../application/dto/BankingDTO';

export interface ApplyBankedOutput {
    applied: number;
    remainingBanked: number;
}

export interface ApplyBankedUseCase {
    execute(input: ApplyBankedBodyDto): Promise<ApplyBankedOutput>;
}
