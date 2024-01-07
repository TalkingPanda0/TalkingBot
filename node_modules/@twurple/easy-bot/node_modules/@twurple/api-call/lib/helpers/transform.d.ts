import { type Response } from '@d-fischer/cross-fetch';
import type { TwitchApiCallOptions } from '../TwitchApiCallOptions';
/** @private */
export declare function handleTwitchApiResponseError(response: Response, options: TwitchApiCallOptions): Promise<void>;
/** @private */
export declare function transformTwitchApiResponse<T>(response: Response): Promise<T>;
//# sourceMappingURL=transform.d.ts.map