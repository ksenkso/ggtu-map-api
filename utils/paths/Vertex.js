class Vertex {
    constructor(node) {
        this.position = node.position;
        this.id = node.id;
        this.siblings = node.siblings;
        this.parent = null;
        this.heuristicCost = 0;
        this.reachCost = Infinity;
        this.totalCost = Infinity;
        this.isClosed = false;
    }

    /**
     *
     * @param {{position: Point3D}} v1
     * @param {{position: Point3D}} v2
     */
    static distance(v1, v2) {
        return Math.sqrt(
            (v1.position.x - v2.position.x) ** 2 +
            (v1.position.y - v2.position.y) ** 2 +
            (v1.position.z - v2.position.z) ** 2
        );
    }

}
module.exports = Vertex;
