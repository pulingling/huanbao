 class EventBus {
    constructor() {
        this.EventCache = {};
    }

    on(type, self, handler) {
        let cache = this.EventCache[type] || (this.EventCache[type] = {});
        
        cache[self.__wxExparserNodeId__] = handler;
    }

    emit(type, ...param) {
        let cache = this.EventCache[type];

        if (!cache) return;

        for (let key in cache) cache[key] && cache[key].call(this, ...param);
    }

    off(type, self) {
        let cache = this.EventCache[type];

        for (let key in cache) key === self.__wxExparserNodeId__ && (delete this.EventCache[type][key]);
    }
}
module.exports = { EventBus }