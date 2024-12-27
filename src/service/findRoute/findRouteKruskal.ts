/**
 * 克鲁斯卡尔算法
 * @description 最小生成树算法实现
 * @author 范宏泰
 */

import type {JCGraph} from "@/JCGraph";
import type {JCLocation} from "@/location";

type Edge = {
    start: number;
    end: number;
    weight: number;
}

// 并查集实现
class UnionFind {
    parent: number[];
    rank: number[];

    constructor(size: number) {
        this.parent = Array(size).fill(0).map((_, index) => index);
        this.rank = Array(size).fill(0);
    }

    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // 路径压缩
        }
        return this.parent[x];
    }

    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX !== rootY) {
            // 按秩合并
            if (this.rank[rootX] > this.rank[rootY]) {
                this.parent[rootY] = rootX;
            } else if (this.rank[rootX] < this.rank[rootY]) {
                this.parent[rootX] = rootY;
            } else {
                this.parent[rootY] = rootX;
                this.rank[rootX]++;
            }
            return true;
        }
        return false;
    }
}

// 克鲁斯卡尔算法实现最小生成树
const kruskal = (graph: JCGraph) => {
    const n = graph.locations.length;
    const edges: Edge[] = [];

    // 构造所有边
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (graph.graph[i][j] !== 0) {
                edges.push({
                    start: i,
                    end: j,
                    weight: graph.graph[i][j]
                });
            }
        }
    }

    // 按照边的权重排序
    edges.sort((a, b) => a.weight - b.weight);

    const uf = new UnionFind(n);
    const mst: Edge[] = [];
    let totalDistance = 0;

    // 使用并查集构建最小生成树
    for (let edge of edges) {
        if (uf.union(edge.start, edge.end)) {
            mst.push(edge);
            totalDistance += edge.weight;
        }
    }

    return { mst, totalDistance };
};

// 查找最短路径的函数
export const findShortestPath = (graph: JCGraph): { locations: JCLocation[], totalDistance: number } => {
    const { mst, totalDistance } = kruskal(graph);

    // 获取最小生成树对应的地点信息
    const locations = new Set<string>();
    mst.forEach(edge => {
        locations.add(graph.locations[edge.start].name);
        locations.add(graph.locations[edge.end].name);
    });

    const locationList = Array.from(locations).map(name =>
        graph.locations.find(location => location.name === name) as JCLocation
    );

    return {
        locations: locationList,
        totalDistance
    };
};
