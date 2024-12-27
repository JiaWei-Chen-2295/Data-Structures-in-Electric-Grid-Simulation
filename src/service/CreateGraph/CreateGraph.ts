import type {JCLocation} from "@/location";
import {getDrivingDistanceBetweenLocations} from "@/service/GetDrivingDistance/getDrivingDistance.ts";
import type {JCGraph} from "@/JCGraph";
import {useCompletePercentStore} from "@/stores/counter.ts";
import {getMoneyBetweenLocations} from "@/service/GetMoney/getMoney.ts";
import {findShortPath} from "@/service/findRoute/findShortPath.ts";


/**
 * 创建邻接矩阵，用于存储节点之间的距离信息。
 * @param locations - 地点数组
 */
export async function createGraph(locations: JCLocation[]): JCGraph {

    const completePercentStore = useCompletePercentStore();

    let {graph, distance} = await findShortPath(locations[0], locations[1]);
    console.log("distance", distance)
    console.log("graph", graph)
    let total = locations.length * locations.length;
    let count = 0;
    let completePercent = 0.0;

    while (total != 0) {
        await new Promise(resolve => setTimeout(resolve, 250 * 2));
        total-=1;

        // 用于进度条展示
        count++
        completePercent = count / total * 100;
        completePercentStore.setPercent(completePercent.toFixed(0))
    }


    return graph;
}


export async function createMoneyGraph(locations: JCLocation[]): JCGraph {

    const completePercentStore = useCompletePercentStore();
    // 创建一个空的邻接矩阵，初始化为无穷大（表示未知的距离）
    let graph: number[][] = Array.from({length: locations.length}, () =>
        new Array(locations.length).fill(Infinity)
    );

    // 设置从节点到自身的距离为0
    for (let i = 0; i < locations.length; i++) {
        graph[i][i] = 0;
    }
    const total = locations.length * locations.length;
    let count = 0;
    let completePercent = 0.0;
    // 对于每一个地点对 (i, j)，计算它们之间的驾驶距离
    for (let i = 0; i < locations.length; i++) {
        for (let j = 0; j < locations.length; j++) { // 修改为从 0 开始
            // 增加延时 防止人家封禁我们呢~~~~~
            await new Promise(resolve => setTimeout(resolve, 250 * 2));

            // 用于进度条展示
            count++
            completePercent = count / total * 100;
            completePercentStore.setPercent(completePercent.toFixed(0))

            // 构建图
            if (i !== j) { // 确保不计算节点到自身的距离
                // 调用地图API获取从 i 到 j 的驾驶距离
                let money = await getMoneyBetweenLocations(locations[i], locations[j]);

                // 更新图中的权重
                graph[i][j] = money;

            }
        }
    }

    const jcGraph: JCGraph = {
        locations: locations,
        graph: graph
    };
    return jcGraph;
}

