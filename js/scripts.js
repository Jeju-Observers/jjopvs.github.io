document.addEventListener("DOMContentLoaded", function () {
  if (typeof kakao !== "undefined" && kakao.maps) {
    kakao.maps.load(function () {
      var mapContainer = document.getElementById("map");
      var mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
        mapTypeId: kakao.maps.MapTypeId.HYBRID,
      };
      var map = new kakao.maps.Map(mapContainer, mapOption);

      // 확대 및 축소 컨트롤 추가
      var zoomControl = new kakao.maps.ZoomControl();
      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

      // 주소 검색 기능 추가
      var geocoder = new kakao.maps.services.Geocoder();
      var addressInput = document.getElementById("addressInput");
      var searchBtn = document.getElementById("searchBtn");

      searchBtn.addEventListener("click", function () {
        var address = addressInput.value;

        if (address) {
          geocoder.addressSearch(address, function (result, status) {
            console.log("Status:", status);
            console.log("Result:", result);
            if (status === kakao.maps.services.Status.OK) {
              var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
              map.setCenter(coords);
              var marker = new kakao.maps.Marker({
                position: coords,
              });
              marker.setMap(map);
            } else {
              alert("주소를 찾을 수 없습니다.");
            }
          });
        } else {
          alert("주소를 입력해주세요.");
        }
      });
    });
  } else {
    console.error("Kakao maps API is not loaded.");
  }
});
