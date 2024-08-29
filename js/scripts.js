// 지도를 표시할 div와 지도 옵션 설정
var mapContainer = document.getElementById("map"),
  mapOption = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
    mapTypeId: kakao.maps.MapTypeId.HYBRID, // kakao.maps.MapTypeId.SKYVIEW : 주소 없이 표시
  };

// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOption);
