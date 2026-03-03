import { GetLedgerQueryDto } from '../../application/dto/BankingDTO';

export interface LedgerRecord {
    bankEntryId: string;
    type: string;
    amount: number;
    createdAt: string;
}

export interface GetLedgerOutput {
    data: LedgerRecord[];
    total: number;
}

export interface GetLedgerUseCase {
    execute(query: GetLedgerQueryDto): Promise<GetLedgerOutput>;
}
