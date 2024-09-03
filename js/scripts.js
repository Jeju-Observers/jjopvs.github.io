document.addEventListener("DOMContentLoaded", function () {
  if (typeof kakao !== "undefined" && kakao.maps) {
    kakao.maps.load(function () {
      var mapContainer = document.getElementById("map");
      var mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
        mapTypeId: kakao.maps.MapTypeId.HYBRID, // SKYVIEW
      };
      var map = new kakao.maps.Map(mapContainer, mapOption);

      var currentMarker = null; // 현재 마커를 저장할 변수
      var currentInfoWindow = null; // 현재 마커를 저장할 변수

      var zoomControl = new kakao.maps.ZoomControl();
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

      var addressInput = document.getElementById("addressInput");
      var searchBtn = document.getElementById("searchBtn");

      searchBtn.addEventListener("click", function () {
        var address = addressInput.value;
        var citySelect = document.getElementById("city-select");
        var selectedOption = citySelect.options[citySelect.selectedIndex];
        var city = selectedOption.text;
        var subSelect = document.getElementById("sub-select");
        var selectedOption2 = subSelect.options[subSelect.selectedIndex];
        var subRegion = selectedOption2.text;
        var subRegion2 = document.getElementById("sub-select2").value;

        if (address) {
          // 테스트 주소 검색
          searchAddress(address);
        } else if (city && subRegion) {
          searchLocationByRegion(city, subRegion, subRegion2);
        } else {
          alert("주소를 입력하거나 지역을 선택해 주세요.");
        }
      });
      // 주소 검색 함수
      function searchAddress(address) {
        var apiKey = "dfbb74820046d84b66cddc42c01d958e"; // 발급받은 REST API 키로 교체하세요
        var url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
          address
        )}`;

        fetch(url, {
          headers: {
            Authorization: `KakaoAK ${apiKey}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("네트워크 응답이 올바르지 않습니다.");
            }
            return response.json();
          })
          .then((data) => {
            if (data.documents && data.documents.length > 0) {
              var coords = new kakao.maps.LatLng(
                data.documents[0].y,
                data.documents[0].x
              );
              map.setCenter(coords);
              addMarker(coords);
            } else {
              console.error("주소 검색 결과가 없습니다.");
            }
          })
          .catch((error) => {
            console.error("주소 검색 요청 실패:", error);
            alert(
              "주소 검색에 실패했습니다. 올바른 주소를 입력했는지 확인해 주세요."
            );
          });
      }
      function searchLocationByRegion(city, subRegion, subRegion2) {
        var query = `${city} ${subRegion} ${subRegion2}`.trim();
        searchAddress(query);
      }
      function addMarker(coords) {
        // 기존 마커가 있으면 제거
        if (currentMarker) {
          currentMarker.setMap(null);
        }

        if (currentInfoWindow) {
          currentInfoWindow.setMap(null);
        }

        // 새로운 마커 추가
        currentMarker = new kakao.maps.Marker({
          map: map,
          position: coords,
        });

        var infoWindowContent = `
        <div style="width:350px;padding:10px; max-height:600px; overflow-y:auto;">
          <div class="text-right">
            <button id="closeBtn" class="btn btn-danger btn-sm">X</button>
          </div>
          <div style="display: flex; margin-bottom: 10px;">
            <div style="flex: 1; padding-right: 10px;">
              <strong>최근 이미지</strong>
              <img src="https://via.placeholder.com/150x100" alt="Recent Image" style="width:100%;"/>
              <p class="text-center">2024. 09. 15</p>
            </div>
            <div style="flex: 1;">
              <strong>비교 이미지</strong>
              <img src="https://via.placeholder.com/150x100" alt="Comparison Image" style="width:100%;"/>
              <p class="text-center">2024. 08. 19</p>
            </div>
          </div>
          <hr style="margin: 10px 0;">
          <div id="imageCarousel" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <div class="row">
                  <div class="col-6">
                    <img src="./image1.png" alt="2024.07.31" style="width:100%;" />
                    <p class="text-center">2024. 07. 31</p>
                  </div>
                  <div class="col-6">
                    <img src="./image2.png" alt="2024.07.14" style="width:100%;" />
                    <p class="text-center">2024. 07. 14</p>
                  </div>
                </div>
              </div>
              <div class="carousel-item">
                <div class="row">
                  <div class="col-6">
                    <img src="./image3.png" alt="2024.06.10" style="width:100%;" />
                    <p class="text-center">2024. 06. 10</p>
                  </div>
                  <div class="col-6">
                    <img src="./image4.png" alt="2024.04.30" style="width:100%;" />
                    <p class="text-center">2024. 04. 30</p>
                  </div>
                </div>
              </div>
            </div>
            <a class="carousel-control-prev" href="#imageCarousel" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#imageCarousel" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>`;

        // 인포윈도우 추가
        currentInfoWindow = new kakao.maps.InfoWindow({
          content: infoWindowContent,
        });
        currentInfoWindow.open(map, currentMarker);

        // 인포윈도우 닫기 버튼에 이벤트 리스너 추가
        setTimeout(() => {
          document
            .getElementById("closeBtn")
            .addEventListener("click", function () {
              currentInfoWindow.close();
            });
        }, 0);
      }
    });
  } else {
    console.error("Kakao maps API is not loaded.");
  }
});

function enableSubSelect() {
  const citySelect = document.getElementById("city-select");
  const selectedCity = citySelect.value;
  const subSelect = document.getElementById("sub-select");
  // const selectedsubSelect = subSelect.value;

  // 하위 선택지 초기화
  subSelect.innerHTML = '<option value="">읍/면/동을 선택하세요</option>';
  subSelect.disabled = false; // 하위 선택지를 활성화

  if (selectedCity === "jeju") {
    subSelect.innerHTML += `
      <option value="hanlim">한림읍</option>
      <option value="aewol">애월읍</option>
      <option value="gujwa">구좌읍</option>
      <option value="jocheon">조천읍</option>
      <option value="hangyeong">한경면</option>
      <option value="chuja">추자면</option>
      <option value="udo">우도면</option>
      <option value="ildo1">일도1동</option>
      <option value="ildo2">일도2동</option>
      <option value="ido1">이도1동</option>
      <option value="ido2">이도2동</option>
      <option value="samdo1">삼도1동</option>
      <option value="samdo2">삼도2동</option>
      <option value="yongdam1">용담1동</option>
      <option value="yongdam2">용담2동</option>
      <option value="geonib">건입동</option>
      <option value="hwabuk">화북동</option>
      <option value="samyang">삼양동</option>
      <option value="bonggae">봉개동</option>
      <option value="ala">아라동</option>
      <option value="ola">오라동</option>
      <option value="yeon">연동</option>
      <option value="nohyeong">노형동</option>
      <option value="oedo">외도동</option>
      <option value="iho">이호동</option>
      <option value="dodu">도두동</option>    
      `;
  } else if (selectedCity === "seogwipo") {
    subSelect.innerHTML += `
      <option value="daejeong">대정읍</option>
      <option value="namwon">남원읍</option>
      <option value="seongsan">성산읍</option>
      <option value="andeok">안덕면</option>
      <option value="pyoseon">표선면</option>
      <option value="songsan">송산동</option>
      <option value="jeongbang">정방동</option>
      <option value="jungang">중앙동</option>
      <option value="cheonji">천지동</option>
      <option value="hyodon">효돈동</option>
      <option value="yeongcheon">영천동</option>
      <option value="donghong">동홍동</option>
      <option value="seohong">서홍동</option>
      <option value="daelyun">대륜동</option>
      <option value="daecheon">대천동</option>
      <option value="jungmun">중문동</option>
      <option value="yelae">예래동</option>
    `;
  }
}

function checkCitySelection() {
  const citySelect = document.getElementById("city-select");
  const subSelect = document.getElementById("sub-select");

  if (citySelect.value === "") {
    alert("먼저 시를 선택하세요.");
    subSelect.value = ""; // 잘못된 선택을 초기화
  }
}

function enableSubSelect2() {
  const citySelect = document.getElementById("city-select");
  const selectedCity = citySelect.value;
  const subSelect = document.getElementById("sub-select");
  const selectedsubSelect = subSelect.value;
  const subSelect2 = document.getElementById("sub-select2");

  subSelect2.innerHTML = '<option value="">읍/면/동을 선택하세요</option>';
  subSelect2.disabled = false; // 하위 선택지를 활성화

  if (selectedCity === "jeju") {
    const optionsData = {
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
    if (optionsData[selectedsubSelect]) {
      optionsData[selectedsubSelect].forEach(function (area) {
        const option = document.createElement("option");
        option.value = area;
        option.text = area;
        subSelect2.appendChild(option);
      });
    }
  } else if (selectedCity === "seogwipo") {
    const optionsData2 = {
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
    if (optionsData2[selectedsubSelect]) {
      optionsData2[selectedsubSelect].forEach(function (area) {
        const option = document.createElement("option");
        option.value = area;
        option.text = area;
        subSelect2.appendChild(option);
      });
    }
  }
}

function checkCitySelection2() {
  const subSelect = document.getElementById("sub-select");
  const subSelect2 = document.getElementById("sub-select2");

  if (subSelect.value === "") {
    alert("먼저 읍/면/동을 선택하세요.");
    subSelect2.value = ""; // 잘못된 선택을 초기화
  }
}

function toggleAddressInput() {
  const addressInputContainer = document.getElementById(
    "addressInputContainer"
  );
  if (addressInputContainer.style.display === "none") {
    addressInputContainer.style.display = "block";
  } else {
    addressInputContainer.style.display = "none";
  }
}
