import { promiseWithResolvers } from '@d-fischer/shared-utils';
export class TokenFetcher {
    constructor(executor) {
        this._newTokenScopeSets = [];
        this._newTokenPromise = null;
        this._queuedScopeSets = [];
        this._queueExecutor = null;
        this._queuePromise = null;
        this._executor = executor;
    }
    async fetch(...scopeSets) {
        var _a;
        const filteredScopeSets = scopeSets.filter((val) => Boolean(val));
        if (this._newTokenPromise) {
            if (!filteredScopeSets.length) {
                return await this._newTokenPromise;
            }
            if (this._queueExecutor) {
                this._queuedScopeSets.push(...filteredScopeSets);
            }
            else {
                this._queuedScopeSets = [...filteredScopeSets];
            }
            if (!this._queuePromise) {
                const { promise, resolve, reject } = promiseWithResolvers();
                this._queuePromise = promise;
                this._queueExecutor = async () => {
                    var _a;
                    if (!this._queuePromise) {
                        return;
                    }
                    this._newTokenScopeSets = this._queuedScopeSets;
                    this._queuedScopeSets = [];
                    this._newTokenPromise = this._queuePromise;
                    this._queuePromise = null;
                    this._queueExecutor = null;
                    try {
                        resolve(await this._executor(this._newTokenScopeSets));
                    }
                    catch (e) {
                        reject(e);
                    }
                    finally {
                        this._newTokenPromise = null;
                        this._newTokenScopeSets = [];
                        (_a = this._queueExecutor) === null || _a === void 0 ? void 0 : _a.call(this);
                    }
                };
            }
            return await this._queuePromise;
        }
        this._newTokenScopeSets = [...filteredScopeSets];
        const { promise, resolve, reject } = promiseWithResolvers();
        this._newTokenPromise = promise;
        try {
            resolve(await this._executor(this._newTokenScopeSets));
        }
        catch (e) {
            reject(e);
        }
        finally {
            this._newTokenPromise = null;
            this._newTokenScopeSets = [];
            (_a = this._queueExecutor) === null || _a === void 0 ? void 0 : _a.call(this);
        }
        return await promise;
    }
}
