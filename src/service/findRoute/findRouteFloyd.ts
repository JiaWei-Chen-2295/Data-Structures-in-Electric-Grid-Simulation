import type {JCLocation} from "@/location";
import type {JCGraph} from "@/JCGraph";

/**
 * 返回最短路径的路径和距离
 * @author 陈建宇 李梓阳
 * @param graph
 * @returns
 */
export const findShortestPathFloyd = (graph: JCGraph): { locations: JCLocation[], totalDistance: number } => {
    console.log("graph", graph.locations.length)
    const n = graph.locations.length;
    let minDistance = Infinity;
    let bestPath: number[] = [];

    // Helper function to calculate the total distance of a path
    const calculateTotalDistance = (path: number[]): number => {
        let distance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            distance += graph.graph[path[i]][path[i + 1]];
        }
        return distance;
    };

    // Generate all permutations and find the one with the minimum distance
    const permute = (arr: number[], m: number[] = []) => {
        if (arr.length === 0) {
            const distance = calculateTotalDistance(m);
            if (distance < minDistance) {
                minDistance = distance;
                bestPath = [...m];
            }
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr, m.concat(next));
            }
        }
    };

    // Start permutation from each node to consider all possible starting points
    for (let start = 0; start < n; start++) {
        let remainingNodes = [...Array(n).keys()].filter(x => x !== start);
        permute(remainingNodes, [start]);
    }

    // Construct the result based on the best found path
    const locations = bestPath.map(index => graph.locations[index]);
    // Adding the distance from the last location back to the first to complete the cycle
    const totalDistance = minDistance + graph.graph[bestPath[bestPath.length - 1] || 0][bestPath[0]];

    return {
        locations,
        totalDistance
    };
};
