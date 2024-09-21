// Constants
const API_KEY = "dfbb74820046d84b66cddc42c01d958e";
const INITIAL_CENTER = { lat: 33.450701, lng: 126.570667 };
const INITIAL_LEVEL = 3;

// DOM Elements
const mapContainer = document.getElementById("map");
const addressInput = document.getElementById("addressInput");
const searchBtn = document.getElementById("searchBtn");
const citySelect = document.getElementById("city-select");
const subSelect = document.getElementById("sub-select");
const subSelect2 = document.getElementById("sub-select2");

// Global variables
let map, drawingManager, currentMarker, currentInfoWindow;

document.addEventListener("DOMContentLoaded", initializeMap);

function initializeMap() {
  if (typeof kakao === "undefined" || !kakao.maps) {
    console.error("Kakao maps API is not loaded.");
    return;
  }

  kakao.maps.load(() => {
    map = new kakao.maps.Map(mapContainer, {
      center: new kakao.maps.LatLng(INITIAL_CENTER.lat, INITIAL_CENTER.lng),
      level: INITIAL_LEVEL,
      mapTypeId: kakao.maps.MapTypeId.HYBRID,
    });

    setupEventListeners();
    setupControls();
    checkUrlParams();
  });
}

function setupEventListeners() {
  searchBtn.addEventListener("click", handleSearch);
  citySelect.addEventListener("change", enableSubSelect);
  subSelect.addEventListener("change", () => {
    checkCitySelection();
    enableSubSelect2();
  });
  subSelect2.addEventListener("change", checkCitySelection2);

  kakao.maps.event.addListener(map, "click", handleMapClick);
  kakao.maps.event.addListener(map, "mousemove", handleMouseMove);
  kakao.maps.event.addListener(map, "rightclick", handleRightClick);
}

function setupControls() {
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const address = urlParams.get("address");
  if (address) {
    searchAddress(address);
  }
}

function handleSearch() {
  const address = addressInput.value;
  const city = citySelect.options[citySelect.selectedIndex].text;
  const subRegion = subSelect.options[subSelect.selectedIndex].text;
  const subRegion2 = subSelect2.value;

  if (address) {
    searchAddress(address);
  } else if (city && subRegion) {
    searchLocationByRegion(city, subRegion, subRegion2);
  } else {
    alert("주소를 입력하거나 지역을 선택해 주세요.");
  }
}

async function searchAddress(address) {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
        address
      )}`,
      {
        headers: { Authorization: `KakaoAK ${API_KEY}` },
      }
    );

    if (!response.ok) {
      throw new Error("네트워크 응답이 올바르지 않습니다.");
    }

    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      const coords = new kakao.maps.LatLng(
        data.documents[0].y,
        data.documents[0].x
      );
      map.setCenter(coords);
      addMarker(coords, address);
    } else {
      console.error("주소 검색 결과가 없습니다.");
    }
  } catch (error) {
    console.error("주소 검색 요청 실패:", error);
    alert("주소 검색에 실패했습니다. 올바른 주소를 입력했는지 확인해 주세요.");
  }
}

function searchLocationByRegion(city, subRegion, subRegion2) {
  const query = `${city} ${subRegion} ${subRegion2}`.trim();
  searchAddress(query);
}

function addMarker(coords, address) {
  if (currentMarker) {
    currentMarker.setMap(null);
  }

  if (currentInfoWindow) {
    currentInfoWindow.close();
  }

  currentMarker = new kakao.maps.Marker({
    map: map,
    position: coords,
  });

  const infoWindowContent = createInfoWindowContent(address);

  currentInfoWindow = new kakao.maps.InfoWindow({
    content: infoWindowContent,
  });
  currentInfoWindow.open(map, currentMarker);

  setTimeout(() => {
    document
      .getElementById("closeBtn")
      .addEventListener("click", () => currentInfoWindow.close());
  }, 0);
}
function normalizeAddress(address) {
  return address.replace(/^(제주특별자치도|제주시|서귀포시)\s?/, "").trim();
}

// 부분 주소 매칭 함수
function findMatchingAddress(searchAddress) {
  const normalizedSearch = normalizeAddress(searchAddress);

  for (let fullAddress in data) {
    const normalizedFull = normalizeAddress(fullAddress);
    if (normalizedFull.includes(normalizedSearch)) {
      return fullAddress;
    }
  }

  return null; // 매칭되는 주소가 없을 경우
}

function createInfoWindowContent(address) {
  const matchingAddress = findMatchingAddress(address);
  const locationData = matchingAddress ? data[matchingAddress] : null;
  console.log(locationData);
  if (!locationData) {
    return "<div>해당 주소의 데이터가 없습니다.</div>";
  }

  var infoWindowContent = `
  <div style="width: 400px; padding: 10px; max-height: 600px; overflow-y: auto;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <ul class="nav nav-tabs" id="myTab" role="tablist" style="flex-grow: 1;">
        <li class="nav-item">
          <a class="nav-link active" id="tab1-tab" data-toggle="tab" href="#tab1" role="tab" aria-controls="tab1" aria-selected="true">농지정보</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="tab2-tab" data-toggle="tab" href="#tab2" role="tab" aria-controls="tab2" aria-selected="false">이미지비교</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="tab3-tab" data-toggle="tab" href="#tab3" role="tab" aria-controls="tab3" aria-selected="false">위반정보상세</a>
        </li>
      </ul>
      <button id="closeBtn" class="btn btn-danger btn-sm" style="margin-left: 10px;">X</button>
    </div>

    <div class="tab-content" id="myTabContent">
      <!-- Tab 1 Content -->
      <div class="tab-pane fade show active" id="tab1" role="tabpanel" aria-labelledby="tab1-tab">
        <div class="mt-2">
          <div class="status-box">
            <div class="status-header">
              <div class="status-indicator">
                <div class="green-dot"></div>
                <h3>종합 상태: 정상</h3>
              </div>
              <button>과거 사진 비교 ></button>
            </div>

            <div class="info-section">
              <h4>기본 정보</h4>
              <p>농지ID: ${locationData["fml_id"]}</p>
              <p>주소: ${matchingAddress}</p>
              <p>면적: ${locationData["parea"]} m²</p>
              <p>관련된 토지 면적: ${locationData["fml_ar"]} m²</p>
              <p>농지구분: ${locationData["fml_se_code"]}</p>            
              <p>농지지목: ${locationData["jimok_nm"]}</p>
              <p>공부지목: ${locationData["rlnd_jimk_code"]}</p>
              <p>실제지목: ${locationData["fact_jimk_code"]}</p>
            </div>

            <div class="info-section">
              <h4>경작 정보</h4>
              <p>경작 여부/주재배작물	: ${locationData["mst_cult_crp_code"]}</p>
            </div>

            <div class="info-section">
              <h4>토지 대장</h4>
              <p>토지이동일: ${locationData["land_mov_ymd"]}</p>
              <p>토지이동(변동)사유: ${locationData["land_mov_rsn_cd_nm"]}</p>  
              <p>소유권변동일자: ${locationData["own_rgt_chg_ymd"]}</p>
              <p>소유구분: ${locationData["own_gbn_nm"]}</p>  
              <p>소유권변동원인	: ${locationData["own_rgt_chg_rsn_cd_nm"]}</p>
            </div>

            <div class="info-section">
              <h4>개별공시지가</h4>
              <p>가격기준년도: ${locationData["base_year"]}</p>
              <p>개별공시지가: ${locationData["pnilp"]}</p>  
              <p>기준월: ${locationData["stdmt"]}</p>
              <p>공시일자: ${locationData["pann_ymd"]}</p>  
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2 Content -->
      <div class="tab-pane fade" id="tab2" role="tabpanel" aria-labelledby="tab2-tab">
        <div class="comparison">
            <div>
                <img src="../image/image1.png" alt="최근 이미지">
                <p>최근 이미지</p>
                <p>2024.09.15</p>
            </div>
            <div>
                <img src="../image/image2.png" alt="비교 이미지">
                <p>비교 이미지</p>
                <p>2024.08.19</p>
            </div>
        </div>

        <div class="controls">
            <select id="year">
                <option value="2024">2024년</option>
            </select>
            <select id="month">
                <option value="7">7월</option>
            </select>
            <button id="search">검색</button>
        </div>

        <div class="gallery">
            <div class="gallery-container" id="galleryContainer">
                <div class="gallery-item">
                    <img src="../image/image1.png" alt="2024-07-31">
                    <p>2024.07.31</p>
                </div>
                <div class="gallery-item">
                    <img src="../image/image2.png" alt="2024-07-14">
                    <p>2024.07.14</p>
                </div>
                <div class="gallery-item">
                    <img src="../image/image3.png" alt="2024-06-10">
                    <p>2024.06.10</p>
                </div>
                <div class="gallery-item">
                    <img src="../image/image4.png" alt="2024-04-30">
                    <p>2024.04.30</p>
                </div>
            </div>
        </div>
      </div>

      <!-- Tab 3 Content -->
      <div class="tab-pane fade" id="tab3" role="tabpanel" aria-labelledby="tab3-tab">
        <div class="mt-2">
          <div class="container">
              <h2>위반 정보 상세</h2>
              <div class="summary">
                  행정 처분 2회 | 신고 1회
              </div>
              <table>
                  <thead>
                      <tr>
                          <th>일자</th>
                          <th>구분</th>
                          <th>내용</th>
                          <th>상태</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>2024-05-10</td>
                          <td>행정 처분</td>
                          <td>소유주 조건 위반</td>
                          <td>처리 중</td>
                      </tr>
                      <tr>
                          <td>2023-10-07</td>
                          <td>행정 처분</td>
                          <td>불법 휴업</td>
                          <td>처리 완료</td>
                      </tr>
                      <tr>
                          <td>2023-07-25</td>
                          <td>신고 일반</td>
                          <td>신고 접수</td>
                          <td>처리 완료</td>
                      </tr>
                  </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return infoWindowContent;
}

function enableSubSelect() {
  const selectedCity = citySelect.value;
  subSelect.innerHTML = '<option value="">읍/면/동을 선택하세요</option>';
  subSelect.disabled = false;

  const options =
    selectedCity === "jeju" ? getJejuOptions() : getSeogwipoOptions();
  options.forEach((option) => {
    subSelect.innerHTML += `<option value="${option.value}">${option.text}</option>`;
  });
}

function getJejuOptions() {
  return [
    { value: "hanlim", text: "한림읍" },
    { value: "aewol", text: "애월읍" },
    { value: "gujwa", text: "구좌읍" },
    { value: "jocheon", text: "조천읍" },
    { value: "hangyeong", text: "한경면" },
    { value: "chuja", text: "추자면" },
    { value: "udo", text: "우도면" },
    { value: "ildo1", text: "일도1동" },
    { value: "ildo2", text: "일도2동" },
    { value: "ido1", text: "이도1동" },
    { value: "ido2", text: "이도2동" },
    { value: "samdo1", text: "삼도1동" },
    { value: "samdo2", text: "삼도2동" },
    { value: "yongdam1", text: "용담1동" },
    { value: "yongdam2", text: "용담2동" },
    { value: "geonib", text: "건입동" },
    { value: "hwabuk", text: "화북동" },
    { value: "samyang", text: "삼양동" },
    { value: "bonggae", text: "봉개동" },
    { value: "ala", text: "아라동" },
    { value: "ola", text: "오라동" },
    { value: "yeon", text: "연동" },
    { value: "nohyeong", text: "노형동" },
    { value: "oedo", text: "외도동" },
    { value: "iho", text: "이호동" },
    { value: "dodu", text: "도두동" },
  ];
}

function getSeogwipoOptions() {
  return [
    { value: "daejeong", text: "대정읍" },
    { value: "namwon", text: "남원읍" },
    { value: "seongsan", text: "성산읍" },
    { value: "andeok", text: "안덕면" },
    { value: "pyoseon", text: "표선면" },
    { value: "songsan", text: "송산동" },
    { value: "jeongbang", text: "정방동" },
    { value: "jungang", text: "중앙동" },
    { value: "cheonji", text: "천지동" },
    { value: "hyodon", text: "효돈동" },
    { value: "yeongcheon", text: "영천동" },
    { value: "donghong", text: "동홍동" },
    { value: "seohong", text: "서홍동" },
    { value: "daelyun", text: "대륜동" },
    { value: "daecheon", text: "대천동" },
    { value: "jungmun", text: "중문동" },
    { value: "yelae", text: "예래동" },
  ];
}

function checkCitySelection() {
  if (citySelect.value === "") {
    alert("먼저 시를 선택하세요.");
    subSelect.value = "";
  }
}

function enableSubSelect2() {
  const selectedCity = citySelect.value;
  const selectedSubSelect = subSelect.value;
  subSelect2.innerHTML = '<option value="">읍/면/동을 선택하세요</option>';
  subSelect2.disabled = false;

  const options =
    selectedCity === "jeju"
      ? getJejuSubOptions(selectedSubSelect)
      : getSeogwipoSubOptions(selectedSubSelect);
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.text = option;
    subSelect2.appendChild(optionElement);
  });
}

function getJejuSubOptions(selectedSubSelect) {
  const subOptions = {
    hanlim: [
      "귀덕리",
      "금능리",
      "금악리",
      "대림리",
      "동명리",
      "명월리",
      "상대리",
      "상명리",
      "수원리",
      "옹포리",
      "월령리",
      "월림리",
      "한림리",
      "한수리",
      "협재리",
    ],
    aewol: [
      "고내리",
      "고성리",
      "곽지리",
      "광령리",
      "구엄리",
      "금성리",
      "남읍리",
      "봉성리",
      "상가리",
      "상귀리",
      "소길리",
      "수산리",
      "신엄리",
      "애월리",
      "어음리",
      "유수암리",
      "장전리",
      "하가리",
      "하귀1리",
      "하귀2리",
    ],
    gujwa: [
      "김녕리",
      "덕천리",
      "동복리",
      "상도리",
      "세화리",
      "송당리",
      "월정리",
      "종달리",
      "평대리",
      "하도리",
      "한동리",
      "행원리",
    ],
    jocheon: [
      "교래리",
      "대흘리",
      "북촌리",
      "선흘리",
      "신촌리",
      "신흥리",
      "와산리",
      "와흘리",
      "조천리",
      "함덕리",
    ],
    hangyeong: [
      "고산리",
      "금등리",
      "낙천리",
      "두모리",
      "신창리",
      "용수리",
      "저지리",
      "조수리",
      "청수리",
      "판포리",
    ],
    chuja: ["대서리", "묵리", "신양리", "영흥리", "예초리"],
    udo: ["연평리"],
    ido2: ["이도2동", "도남동"],
    yongdam2: ["용담2동", "용담3동"],
    hwabuk: ["화북1동", "화북2동"],
    samyang: ["삼양1동", "삼양2동", "삼양3동", "도련1동", "도련2동"],
    bonggae: ["봉개동", "회천동", "용강동"],
    ala: ["아라1동", "아라2동", "월평동", "영평동", "오등동"],
    ola: ["오라1동", "오라2동", "오라3동"],
    nohyeong: ["노형동", "해안동"],
    oedo: ["외도1동", "외도2동", "내도동", "도평동"],
    iho: ["이호1동", "이호2동"],
    dodu: ["도두1동", "도두2동"],
  };
  return subOptions[selectedSubSelect] || [];
}

function getSeogwipoSubOptions(selectedSubSelect) {
  const subOptions = {
    daejeong: [
      "가파리",
      "구억리",
      "동일리",
      "무릉리",
      "보성리",
      "상모리",
      "신도리",
      "신평리",
      "안성리",
      "영락리",
      "인성리",
      "일과리",
      "하모리",
    ],
    namwon: [
      "남원리",
      "수망리",
      "신례리",
      "신흥리",
      "위미리",
      "의귀리",
      "태흥리",
      "하례리",
      "한남리",
    ],
    seongsan: [
      "고성리",
      "난산리",
      "삼달리",
      "성산리",
      "수산리",
      "시흥리",
      "신산리",
      "신양리",
      "신천리",
      "신풍리",
      "오조리",
      "온평리",
    ],
    andeok: [
      "감산리",
      "광평리",
      "대평리",
      "덕수리",
      "동광리",
      "사계리",
      "상창리",
      "상천리",
      "서광리",
      "창천리",
      "화순리",
    ],
    pyoseon: ["가시리", "성읍리", "세화리", "토산리", "표선리", "하천리"],
    songsan: ["보목동", "동홍동", "서귀동", "토평동"],
    jeongbang: ["서귀동"],
    jungang: ["서귀동"],
    cheonji: ["서귀동", "서홍동"],
    hyodon: ["신효동", "하효동"],
    yeongcheon: ["상효동", "토평동"],
    daelyun: ["법환동", "서호동", "호근동"],
    daecheon: ["강정동", "도순동", "영남동", "월평동"],
    jungmun: ["대포동", "중문동", "하원동", "회수동"],
    yelae: ["상예동", "색달동", "하예동"],
  };
  return subOptions[selectedSubSelect] || [];
}

function checkCitySelection2() {
  if (subSelect.value === "") {
    alert("먼저 읍/면/동을 선택하세요.");
    subSelect2.value = "";
  }
}

function toggleAddressInput() {
  const addressInputContainer = document.getElementById(
    "addressInputContainer"
  );
  addressInputContainer.style.display =
    addressInputContainer.style.display === "none" ? "block" : "none";
}

// Drawing-related functions
let drawingFlag = false;
let drawingPolygon;
let polygon;
let areaOverlay;

function handleMapClick(mouseEvent) {
  const clickPosition = mouseEvent.latLng;

  if (!drawingFlag) {
    startDrawing(clickPosition);
  } else {
    continueDrawing(clickPosition);
  }
}

function startDrawing(clickPosition) {
  drawingFlag = true;
  clearExistingShapes();
  createDrawingPolygon(clickPosition);
  createPolygon(clickPosition);
}

function clearExistingShapes() {
  if (polygon) {
    polygon.setMap(null);
    polygon = null;
  }
  if (areaOverlay) {
    areaOverlay.setMap(null);
    areaOverlay = null;
  }
}

function createDrawingPolygon(clickPosition) {
  drawingPolygon = new kakao.maps.Polygon({
    map: map,
    path: [clickPosition],
    strokeWeight: 3,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeStyle: "solid",
    fillColor: "#FF0000",
    fillOpacity: 0.3,
  });
}

function createPolygon(clickPosition) {
  polygon = new kakao.maps.Polygon({
    path: [clickPosition],
    strokeWeight: 3,
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeStyle: "solid",
    fillColor: "#FF0000",
    fillOpacity: 0.3,
  });
}

function continueDrawing(clickPosition) {
  const drawingPath = drawingPolygon.getPath();
  drawingPath.push(clickPosition);
  drawingPolygon.setPath(drawingPath);

  const path = polygon.getPath();
  path.push(clickPosition);
  polygon.setPath(path);
}

function handleMouseMove(mouseEvent) {
  if (drawingFlag) {
    const mousePosition = mouseEvent.latLng;
    const path = drawingPolygon.getPath();
    if (path.length > 1) {
      path.pop();
    }
    path.push(mousePosition);
    drawingPolygon.setPath(path);
  }
}

function handleRightClick(mouseEvent) {
  if (drawingFlag) {
    finishDrawing();
  }
}

function finishDrawing() {
  drawingPolygon.setMap(null);
  drawingPolygon = null;

  const path = polygon.getPath();
  if (path.length > 2) {
    polygon.setMap(map);
    displayAreaOverlay(path);
  } else {
    polygon = null;
  }

  drawingFlag = false;
}

function displayAreaOverlay(path) {
  const area = Math.round(polygon.getArea());
  const content = `<div class="info" style="background:rgba(255,255,255,0.8); padding:5px; border-radius:5px;">총면적 <span class="number"> ${area}</span> m<sup>2</sup></div>`;

  areaOverlay = new kakao.maps.CustomOverlay({
    map: map,
    content: content,
    xAnchor: 0,
    yAnchor: 0,
    position: path[path.length - 1],
  });
}
