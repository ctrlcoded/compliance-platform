"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingController = void 0;
const BankingDTO_1 = require("../../../../core/application/dto/BankingDTO");
class BankingController {
    async getRecords(req, res) {
        const query = BankingDTO_1.getLedgerQuerySchema.parse(req.query);
        res.status(200).json({
            data: [
                {
                    bankEntryId: "B001",
                    type: "BANK",
                    amount: 5000000,
                    createdAt: "2025-02-01T10:00:00Z"
                }
            ],
            pagination: {
                page: query.page,
                limit: query.limit,
                total: 1
            }
        });
    }
    async bank(req, res) {
        const body = BankingDTO_1.bankSurplusBodySchema.parse(req.body);
        res.status(201).json({
            data: {
                bankedAmount: body.amount,
                remainingSurplus: 1000000 // Dummy value 
            }
        });
    }
    async apply(req, res) {
        const body = BankingDTO_1.applyBankedBodySchema.parse(req.body);
        res.status(200).json({
            data: {
                applied: body.amount,
                remainingBanked: 3000000 // Dummy value
            }
        });
    }
}
exports.BankingController = BankingController;
