<template>
  <div class="profile-page">
    <h2>📋 마이 페이지</h2>
    <p>간단한 프로필과 활동 내역을 보여줍니다.</p>

    <div class="card">
      <h3>익명 유저</h3>
      <p>작성한 게시물, 찜한 장소, 리뷰 등을 확인할 수 있습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.profile-page { max-width:800px; margin:0 auto }
.card {
  background:white; padding:20px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06);
  margin-top:16px;
}
</style>