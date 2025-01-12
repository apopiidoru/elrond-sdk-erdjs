import { GasLimit } from "../../networkParams";
import { IInteractionChecker } from "../interface";
import { IProvider } from "../../interface";
import { StrictChecker } from "../strictChecker";
import { ContractLogger } from "./contractLogger";
import { TestWallet } from "../../testutils";
import { Balance } from "../../balance";
import { Err } from "../../errors";
import { getGasFromValue } from "./systemWrapper";

/**
 * Stores contextual information which is needed when preparing a transaction.
 */
export class SendContext {
    private sender_: TestWallet | null;
    private provider_: IProvider;
    private gas_: GasLimit | null;
    private logger_: ContractLogger | null;
    private value_: Balance | null;
    readonly checker: IInteractionChecker;

    constructor(provider: IProvider) {
        this.sender_ = null;
        this.provider_ = provider;
        this.gas_ = null;
        this.logger_ = null;
        this.value_ = null;
        this.checker = new StrictChecker();
    }

    provider(provider: IProvider): this {
        this.provider_ = provider;
        return this;
    }

    sender(sender: TestWallet): this {
        this.sender_ = sender;
        return this;
    }

    gas(gas: number): this {
        this.gas_ = new GasLimit(gas);
        return this;
    }

    autoGas(baseGas: number): this {
        return this.gas(getGasFromValue(baseGas, this.value_));
    }

    logger(logger: ContractLogger | null): this {
        this.logger_ = logger;
        return this;
    }

    value(value: Balance): this {
        this.value_ = value;
        return this;
    }

    getAndResetValue(): Balance | null {
        let value = this.value_;
        this.value_ = null;
        return value;
    }

    getSender(): TestWallet {
        if (this.sender_) {
            return this.sender_;
        }
        throw new Err("sender not set");
    }

    getSenderOptional(): TestWallet | null {
        return this.sender_;
    }

    getProvider(): IProvider {
        return this.provider_;
    }

    getGasLimit(): GasLimit {
        if (this.gas_) {
            return this.gas_;
        }
        throw new Err("gas limit not set");
    }

    getLogger(): ContractLogger | null {
        return this.logger_;
    }
}
