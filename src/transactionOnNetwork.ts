import { Address } from "./address";
import { Balance } from "./balance";
import { GasPrice, GasLimit } from "./networkParams";
import { Nonce } from "./nonce";
import { Signature } from "./signature";
import { TransactionPayload } from "./transactionPayload";
import { Hash } from "./hash";
import { TransactionHash, TransactionStatus } from "./transaction";

/**
 * A plain view of a transaction, as queried from the Network.
 */
export class TransactionOnNetwork {
    type: TransactionOnNetworkType = new TransactionOnNetworkType();
    nonce: Nonce = new Nonce(0);
    round: number = 0;
    epoch: number = 0;
    value: Balance = Balance.Zero();
    receiver: Address = new Address();
    sender: Address = new Address();
    gasPrice: GasPrice = new GasPrice(0);
    gasLimit: GasLimit = new GasLimit(0);
    data: TransactionPayload = new TransactionPayload();
    signature: Signature = Signature.empty();
    status: TransactionStatus = TransactionStatus.createUnknown();

    hyperblockNonce: Nonce = new Nonce(0);
    hyperblockHash: Hash = Hash.empty();

    receipt: Receipt = new Receipt();
    smartContractResults: SmartContractResults = new SmartContractResults();

    constructor(init?: Partial<TransactionOnNetwork>) {
        Object.assign(this, init);
    }

    static fromHttpResponse(response: {
        type: string,
        nonce: number,
        round: number,
        epoch: number,
        value: string,
        sender: string,
        receiver: string,
        gasPrice: number,
        gasLimit: number,
        data: string,
        status: string,
        hyperblockNonce: number,
        hyperblockHash: string,
        receipt: any,
        smartContractResults: any
    }): TransactionOnNetwork {
        let transactionOnNetwork = new TransactionOnNetwork();

        transactionOnNetwork.type = new TransactionOnNetworkType(response.type);
        transactionOnNetwork.nonce = new Nonce(response.nonce || 0);
        transactionOnNetwork.round = response.round;
        transactionOnNetwork.epoch = response.epoch;
        transactionOnNetwork.value = Balance.fromString(response.value);
        transactionOnNetwork.sender = Address.fromBech32(response.sender);
        transactionOnNetwork.receiver = Address.fromBech32(response.receiver);
        transactionOnNetwork.gasPrice = new GasPrice(response.gasPrice);
        transactionOnNetwork.gasLimit = new GasLimit(response.gasLimit);
        transactionOnNetwork.data = TransactionPayload.fromEncoded(response.data);
        transactionOnNetwork.status = new TransactionStatus(response.status);

        transactionOnNetwork.hyperblockNonce = new Nonce(response.hyperblockNonce || 0);
        transactionOnNetwork.hyperblockHash = new Hash(response.hyperblockHash);

        transactionOnNetwork.receipt = Receipt.fromHttpResponse(response.receipt);
        transactionOnNetwork.smartContractResults = response.smartContractResults || [];

        return transactionOnNetwork;
    }
}

/**
 * Not yet implemented.
 */
export class TransactionOnNetworkType {
    readonly value: string;

    constructor(value?: string) {
        this.value = value || "unknown";
    }
}

export class Receipt {
    value: Balance = Balance.Zero();
    sender: Address = new Address();
    message: string = "";
    hash: TransactionHash = TransactionHash.empty();

    static fromHttpResponse(response: {
        value: string,
        sender: string,
        data: string,
        txHash: string
    }): Receipt {
        let receipt = new Receipt();

        receipt.value = Balance.fromString(response.value);
        receipt.sender = new Address(response.sender);
        receipt.message = response.data;
        receipt.hash = new TransactionHash(response.txHash);

        return receipt;
    }
}

export class SmartContractResults {
    items: SmartContractResultItem[] = [];

    static fromHttpResponse(response: {
        smartContractResults: any
    }): SmartContractResults {
        let results = new SmartContractResults();
        results.items = (response.smartContractResults || []).map((item: any) => SmartContractResultItem.fromHttpResponse(item));
        return results;
    }

    getImmediateResult() {
        // throw if ambiguity
        // new ImmediateSmartContractResult() - subclass
        // has VM return code.
    }

    getResultingCalls() {
        // throw if ambiguity
        // new ResultingCall() - subclass
    }
}

export class SmartContractResultItem {
    hash: Hash = Hash.empty();
    nonce: Nonce = new Nonce(0);
    value: Balance = Balance.Zero();
    receiver: Address = new Address();
    sender: Address = new Address();
    dataParts: Buffer[] = [];
    previousHash: Hash = Hash.empty();
    originalHash: Hash = Hash.empty();
    gasLimit: GasLimit = new GasLimit(0);
    gasPrice: GasPrice = new GasPrice(0);
    callType: number = 0;

    static fromHttpResponse(response: {
        hash: string,
        nonce: number,
        value: string,
        receiver: string,
        sender: string,
        data: string,
        prevTxHash: string,
        originalTxHash: string,
        gasLimit: number,
        gasPrice: number,
        callType: number
    }): SmartContractResultItem {
        let item = new SmartContractResultItem();

        item.hash = new TransactionHash(response.hash);
        item.nonce = new Nonce(response.nonce || 0);
        item.value = Balance.fromString(response.value);
        item.receiver = new Address(response.receiver);
        item.sender = new Address(response.sender);
        //item.dataParts = ""
        item.previousHash = new TransactionHash(response.prevTxHash);
        item.originalHash = new TransactionHash(response.originalTxHash);
        item.gasLimit = new GasLimit(response.gasLimit);
        item.gasPrice = new GasPrice(response.gasPrice);
        item.callType = response.callType;

        return item;
    }

    /**
     * If available, will provide a typed outcome (with typed values).
     */
    //private endpointDefinition?: EndpointDefinition;

    // setEndpointDefinition(endpointDefinition: EndpointDefinition) {
    //     //this.endpointDefinition = endpointDefinition;
    // }
}
