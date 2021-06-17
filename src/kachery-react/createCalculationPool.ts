export interface CalculationPool {
    requestSlot: () => Promise<{complete: () => void}>
    pause: () => void
    resume: () => void
    isPaused: () => boolean
}

const createCalculationPool = ({maxSimultaneous, method}: {maxSimultaneous: number, method?: 'stack' | 'queue'}): CalculationPool => {
    return new CalculationPoolImpl({maxSimultaneous, method})
}

interface Slot {
    slotId: number
    complete: () => void
}

const _allCalculationPools: CalculationPool[] = []
export const allCalculationPools = () => {return [..._allCalculationPools]}

class CalculationPoolImpl {
    _maxSimultaneous: number
    _method: 'stack' | 'queue'
    _activeSlots: {[key: string]: Slot} = {}
    _numActiveSlots: number = 0
    _lastSlotId: number = -1
    _pendingRequestCallbacks: ((slot: Slot) => void)[] = []
    _paused: boolean = false
    _resumeCallbacks: (() => void)[] = []
    constructor({maxSimultaneous, method}: {maxSimultaneous: number, method?: 'stack' | 'queue'}) {
        this._maxSimultaneous = maxSimultaneous;
        this._method = method || 'queue'; // stack or queue
        _allCalculationPools.push(this)
    }
    async requestSlot(): Promise<Slot> {
        if (this._paused) {
            return new Promise((resolve, reject) => {
                this._resumeCallbacks.push(() => {
                    this.requestSlot().then(resolve).catch(reject)
                })
            })
        }
        if (this._numActiveSlots < this._maxSimultaneous) {
            const slot = this._createNewSlot();
            return slot;
        }
        return new Promise((resolve, reject) => {
            this._pendingRequestCallbacks.push((slot: Slot) => {
                resolve(slot);
            });
        });
    }
    isPaused() {
        return this._paused
    }
    pause() {
        if (this._paused) return
        this._paused = true
        this._resumeCallbacks = []
    }
    resume() {
        if (!this._paused) return
        this._paused = false
        this._resumeCallbacks.forEach(cb => {cb()})
    }
    _createNewSlot() {
        const slotId = this._lastSlotId + 1;
        this._lastSlotId = slotId;
        this._numActiveSlots ++;
        this._activeSlots[slotId] = {
            slotId,
            complete: () => {
                this._numActiveSlots --;
                delete this._activeSlots[slotId];
                this._update();
            }
        }
        return this._activeSlots[slotId];
    }
    _update() {
        while ((this._pendingRequestCallbacks.length > 0) && (this._numActiveSlots < this._maxSimultaneous)) {
            let cb: ((slot: Slot) => void) | undefined;
            if (this._method === 'queue') {
                cb = this._pendingRequestCallbacks.shift();
            }
            else if (this._method === 'stack') {
                cb = this._pendingRequestCallbacks.pop();
            }
            else {
                throw Error(`Unexpected method in calculation pool: ${this._method}`);
            }
            if (!cb) throw Error('unexpected')
            const slot = this._createNewSlot();
            cb(slot);            
        }
    }
}

export default createCalculationPool