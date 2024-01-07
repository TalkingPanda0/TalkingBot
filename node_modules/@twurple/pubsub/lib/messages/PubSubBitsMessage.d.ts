import { DataObject } from '@twurple/common';
import { type PubSubBitsMessageData } from './PubSubBitsMessage.external';
/**
 * A message that informs about bits being used in a channel.
 */
export declare class PubSubBitsMessage extends DataObject<PubSubBitsMessageData> {
    /**
     * The ID of the user that sent the bits.
     */
    get userId(): string | undefined;
    /**
     * The name of the user that sent the bits.
     */
    get userName(): string | undefined;
    /**
     * The full message that was sent with the bits.
     */
    get message(): string;
    /**
     * The number of bits that were sent.
     */
    get bits(): number;
    /**
     * The total number of bits that were ever sent by the user in the channel.
     */
    get totalBits(): number;
    /**
     * Whether the cheer was anonymous.
     */
    get isAnonymous(): boolean;
}
//# sourceMappingURL=PubSubBitsMessage.d.ts.map