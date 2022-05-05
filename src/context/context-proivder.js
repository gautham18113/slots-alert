class ContextProvider {
    constructor(contextList) {
        this.contextList = contextList;
        this.currentIdx = 0;
        this.currentContext = this.contextList[this.currentIdx];
    }

    next() {

        // Reset if at the end of list
        if(this.currentIdx >= this.contextList.size) this.currentIdx = 0;

        this.currentContext = this.contextList[this.currentIdx];

        this.currentIdx++;

    }

}


module.exports = ContextProvider;