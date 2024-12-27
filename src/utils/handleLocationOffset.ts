// 地球平均半径（单位：米）
const EARTH_RADIUS = 6371000;

/**
 * 根据指定方向和距离调整经纬度坐标，并返回字符串形式。
 *
 * @param coordsStr - 原始经纬度字符串 (格式: "经度,纬度")
 * @param lngDirection - 经度偏移方向 ("E" for East, "W" for West)
 * @param latDirection - 纬度偏移方向 ("N" for North, "S" for South)
 * @param lngDistance - 经度方向上的偏移距离 (单位：米)
 * @param latDistance - 纬度方向上的偏移距离 (单位：米)
 * @returns 调整后的经纬度字符串 (格式: "经度,纬度")
 */
export function adjustCoordinates(coordsStr: string, lngDirection: 'E' | 'W', latDirection: 'N' | 'S', lngDistance: number, latDistance: number): string {
    // 解析输入的经纬度字符串
    const [lngStr, latStr] = coordsStr.split(',').map(str => str.trim());

    // 验证解析结果是否符合预期
    if (!lngStr || !latStr) {
        throw new Error('Invalid coordinates format. Expected format is "经度,纬度".');
    }

    // 将字符串转换为数字，并验证是否为有效数值
    const lng = parseFloat(lngStr);
    const lat = parseFloat(latStr);

    if (isNaN(lng) || isNaN(lat)) {
        throw new Error('Invalid longitude or latitude value.');
    }

    // 确保纬度在有效范围内 (-90到90度)
    if (lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90 degrees.');
    }

    // 确保经度在有效范围内 (-180到180度)
    if (lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180 degrees.');
    }

    // 计算纬度方向上的偏移角度
    const deltaLat = latDistance / EARTH_RADIUS;
    let adjustedLat = lat + (deltaLat * 180 / Math.PI);

    // 根据纬度方向调整纬度值
    if (latDirection === 'S') {
        adjustedLat -= 2 * deltaLat * 180 / Math.PI; // 因为已经加了一次，所以减去两倍
    }

    // 确保调整后的纬度仍在有效范围内
    if (adjustedLat < -90) {
        adjustedLat = -90;
    } else if (adjustedLat > 90) {
        adjustedLat = 90;
    }

    // 将纬度转换为弧度
    const latRad = lat * Math.PI / 180;

    // 计算经度方向上的偏移角度（使用地球半径和余弦定律）
    const deltaLng = lngDistance / (EARTH_RADIUS * Math.cos(latRad));
    let adjustedLng = lng;

    // 根据经度方向调整经度值
    if (lngDirection === 'W') {
        adjustedLng -= deltaLng * 180 / Math.PI;
    } else if (lngDirection === 'E') {
        adjustedLng += deltaLng * 180 / Math.PI;
    }

    // 确保调整后的经度仍在有效范围内
    if (adjustedLng < -180) {
        adjustedLng += 360;
    } else if (adjustedLng > 180) {
        adjustedLng -= 360;
    }

    // 返回调整后的经纬度字符串，保留六位小数
    return `${adjustedLng.toFixed(6)},${adjustedLat.toFixed(6)}`;
}
