/**
 * @author 郭雨桐
 */
import axiosSpecial from "@/plugins/axios-special";
import type {JCLocation} from "@/location";
import type {JCGraph} from "@/JCGraph";

export async function findShortPath(fromLocation: JCLocation, toLocation: JCLocation): { graph: JCGraph, distance: number } {
    const postInfo = {
        orig: fromLocation.lonlat,
        dest: toLocation.lonlat,
        style: 1
    };

    let resultRespStr = '';
     await axiosSpecial.get(
        '/drive',
        {
            params: {
                postStr: JSON.stringify(postInfo),
                type: 'search',
            }
        }
    ).then(resp => {
        resultRespStr = resp.data;
        console.log(resultRespStr)
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(resultRespStr, 'text/xml');
    return createJCGraphFromDoc(xmlDoc);
}


function createJCGraphFromDoc(doc: Document): {graph: JCGraph, totalDistance: number} {
    const graph: JCGraph = {
        locations: [],
        graph: [],
        totalDistance: 0
    };

    const items = doc.querySelectorAll('result routes item');

    // 构建locations和初始化graph矩阵
    items.forEach((item, index) => {
        const location: JCLocation = {
            name: `节点${index}`,
            address: item.querySelector('streetName')?.textContent || item.querySelector('nextStreetName')?.textContent || '未知',
            distance: item.parentElement?.querySelector('simple item')?.getAttribute('streetDistance') || '未知',
            lonlat: item.querySelector('turnlatlon')?.textContent || ''
        };

        graph.locations.push(location);

        // 确保graph矩阵已经初始化
        if (index === 0) {
            for (let i = 0; i < items.length; i++) {
                graph.graph.push(Array(items.length).fill(Infinity));
            }
        }

        // 提取<strguide>中的距离作为权值
        const strguideElement = item.querySelector('strguide');
        const weight = strguideElement ? extractDistance(strguideElement.textContent || '') : 0;

        // 更新graph矩阵，只有在不是第一个节点时才设置权值
        if (index > 0 && !isNaN(weight)) {
            graph.graph[index - 1][index] = weight;
        }
    });

    // 获取总距离并转换为number类型
    let totalDistance;
    const distanceElement = doc.querySelector('result distance');
    if (distanceElement && distanceElement.textContent) {
        // 距离以公里为单位，需要转换为米
        totalDistance = parseFloat(distanceElement.textContent);
        graph.totalDistance = totalDistance;
    }

    return {
        graph,
        totalDistance
    };
}

function extractDistance(strguideText: string): number {
    // 使用正则表达式匹配距离字符串
    const match = strguideText.match(/走(\d+(\.\d+)?)(公里|米)/);
    if (match) {
        const distance = parseFloat(match[1]);
        return match[3] === '公里' ? distance * 1000 : distance; // 将公里转换为米
    }
    return 0; // 如果没有匹配到，则默认返回0
}
