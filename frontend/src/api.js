// api.js
const MOUNTAINS = ['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];
const ELEMENTS = {'子':'水','癸':'水','壬':'水','亥':'水','午':'火','丁':'火','丙':'火','巳':'火','卯':'木','乙':'木','甲':'木','寅':'木','酉':'金','辛':'金','庚':'金','申':'金','艮':'土','坤':'土','辰':'土','戌':'土','未':'土','丑':'土','巽':'木','乾':'金'};

// ★あなたの最新のGAS URL
const GAS_URL = "https://script.google.com/macros/s/AKfycbz3ROMlDSXoeAF4ETtTJqDzp6uJMJQdXe4l2EMDiKre-AKLV9D09EC5n_o56DznCgLm/exec";

export const fetchDirectionInfo = async (angle) => {
  const index = Math.floor(((angle + 7.5) % 360) / 15);
  const mountain = MOUNTAINS[index];
  return { result: { mountain, element: ELEMENTS[mountain] || "不明" } };
};

export const saveToSpreadsheet = async (data) => {
  try {
    const params = new URLSearchParams(data).toString();
    await fetch(`${GAS_URL}?${params}`, { method: "GET", mode: "no-cors" });
    return true;
  } catch (e) { return false; }
};

export const getMapUrl = (mode) => {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const url = mode === 'gsi' 
        ? `https://maps.gsi.go.jp/#16/${latitude}/${longitude}/`
        : `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
      resolve(url);
    }, () => resolve(mode === 'gsi' ? "https://maps.gsi.go.jp/" : "https://maps.google.com/maps?output=embed"));
  });
};