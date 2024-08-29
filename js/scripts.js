document.addEventListener("DOMContentLoaded", function () {
  if (typeof kakao !== "undefined" && kakao.maps) {
    kakao.maps.load(function () {
      var mapContainer = document.getElementById("map");
      var mapOption = {
        center: new kakao.maps.LatLng(33.450701, 126.570667),
        level: 3,
        mapTypeId: kakao.maps.MapTypeId.HYBRID, // kakao.maps.MapTypeId.SKYVIEW : 주소 없이 표시
      };
      var map = new kakao.maps.Map(mapContainer, mapOption);
    });
  } else {
    console.error("Kakao maps API is not loaded.");
  }
});
