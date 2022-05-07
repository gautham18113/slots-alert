class ContextProvider {
    constructor(contextList, dataStore) {
        this.contextList = contextList;
        this.store = dataStore;
        this.toSerialize = {
            counter: 0,
            contextIdx: 0
        }
    }

    getContext() {
        return this.contextList[this.toSerialize.contextIdx];
    }

    getCounter() {
        return this.toSerialize.counter;
    }

    async resetAll() {
        this.toSerialize = {
            contextIdx: 0,
            counter: 0
        }
        await this.updateContext();
    }

    async incrementCounter() {
        this.toSerialize.counter++;
        await this.updateContext();
    }

    async resetCounter() {
        this.toSerialize.counter = 0;
        await this.updateContext();
    }

    async changeContext() {
        this.toSerialize.contextIdx++;
       if(this.toSerialize.contextIdx >= this.contextList.length){
           this.toSerialize.contextIdx = 0;
       }
       await this.updateContext();
    }

    async init() {
        await this.store.read()
            .then((res) => {
                const obj = JSON.parse(res);
                this.toSerialize = {
                    counter: obj.counter || 0,
                    contextIdx: obj.contextIdx || 0
                }
            })
            .catch((err) => console.error(err));
    }

    async updateContext() {
        await this.store.write(JSON.stringify(this.toSerialize))
            .catch((error) => {
                console.error(error);
            })
    }

}


module.exports = ContextProvider;