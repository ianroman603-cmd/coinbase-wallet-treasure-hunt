import {
  prepareEvent,
  prepareContractCall,
  readContract,
  type BaseTransactionOptions,
  type AbiParameterToPrimitiveType,
} from "thirdweb";

/**
* Contract events
*/

/**
 * Represents the filters for the "OwnershipTransferred" event.
 */
export type OwnershipTransferredEventFilters = Partial<{
  previousOwner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"}>
newOwner: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}>
}>;

/**
 * Creates an event object for the OwnershipTransferred event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { ownershipTransferredEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  ownershipTransferredEvent({
 *  previousOwner: ...,
 *  newOwner: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function ownershipTransferredEvent(filters: OwnershipTransferredEventFilters = {}) {
  return prepareEvent({
    signature: "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
    filters,
  });
};
  

/**
 * Represents the filters for the "TreasureClaimed" event.
 */
export type TreasureClaimedEventFilters = Partial<{
  to: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"to","type":"address"}>
}>;

/**
 * Creates an event object for the TreasureClaimed event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { treasureClaimedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  treasureClaimedEvent({
 *  to: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function treasureClaimedEvent(filters: TreasureClaimedEventFilters = {}) {
  return prepareEvent({
    signature: "event TreasureClaimed(address indexed to, uint256 amount, string treasure)",
    filters,
  });
};
  

/**
* Contract read functions
*/

/**
 * Represents the parameters for the "isTreasureClaimed" function.
 */
export type IsTreasureClaimedParams = {
  treasure: AbiParameterToPrimitiveType<{"internalType":"string","name":"treasure","type":"string"}>
};

/**
 * Calls the "isTreasureClaimed" function on the contract.
 * @param options - The options for the isTreasureClaimed function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isTreasureClaimed } from "TODO";
 * 
 * const result = await isTreasureClaimed({
 *  treasure: ...,
 * });
 * 
 * ```
 */
export async function isTreasureClaimed(
  options: BaseTransactionOptions<IsTreasureClaimedParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x8ab4ddb1",
  [
    {
      "internalType": "string",
      "name": "treasure",
      "type": "string"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.treasure]
  });
};




/**
 * Calls the "owner" function on the contract.
 * @param options - The options for the owner function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { owner } from "TODO";
 * 
 * const result = await owner();
 * 
 * ```
 */
export async function owner(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x8da5cb5b",
  [],
  [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ]
],
    params: []
  });
};




/**
 * Calls the "token" function on the contract.
 * @param options - The options for the token function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { token } from "TODO";
 * 
 * const result = await token();
 * 
 * ```
 */
export async function token(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xfc0c546a",
  [],
  [
    {
      "internalType": "contract IERC20",
      "name": "",
      "type": "address"
    }
  ]
],
    params: []
  });
};


/**
* Contract write functions
*/

/**
 * Represents the parameters for the "claimTreasure" function.
 */
export type ClaimTreasureParams = {
  to: AbiParameterToPrimitiveType<{"internalType":"address","name":"to","type":"address"}>
amount: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"amount","type":"uint256"}>
treasure: AbiParameterToPrimitiveType<{"internalType":"string","name":"treasure","type":"string"}>
};

/**
 * Calls the "claimTreasure" function on the contract.
 * @param options - The options for the "claimTreasure" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { claimTreasure } from "TODO";
 * 
 * const transaction = claimTreasure({
 *  to: ...,
 *  amount: ...,
 *  treasure: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function claimTreasure(
  options: BaseTransactionOptions<ClaimTreasureParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x6ca44483",
  [
    {
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    },
    {
      "internalType": "string",
      "name": "treasure",
      "type": "string"
    }
  ],
  []
],
    params: [options.to, options.amount, options.treasure]
  });
};




/**
 * Calls the "renounceOwnership" function on the contract.
 * @param options - The options for the "renounceOwnership" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { renounceOwnership } from "TODO";
 * 
 * const transaction = renounceOwnership();
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function renounceOwnership(
  options: BaseTransactionOptions
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x715018a6",
  [],
  []
],
    params: []
  });
};


/**
 * Represents the parameters for the "transferOwnership" function.
 */
export type TransferOwnershipParams = {
  newOwner: AbiParameterToPrimitiveType<{"internalType":"address","name":"newOwner","type":"address"}>
};

/**
 * Calls the "transferOwnership" function on the contract.
 * @param options - The options for the "transferOwnership" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { transferOwnership } from "TODO";
 * 
 * const transaction = transferOwnership({
 *  newOwner: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function transferOwnership(
  options: BaseTransactionOptions<TransferOwnershipParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0xf2fde38b",
  [
    {
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }
  ],
  []
],
    params: [options.newOwner]
  });
};


