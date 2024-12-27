<template>
  <a-layout class="layout" style="min-height: 100vh;">
    <a-layout-header class="header">
      <a-space size="large" class="header-space">
        <div class="logo">
          <img src="https://s1.imagehub.cc/images/2024/12/24/428fdae439cff3fa0c41ff88ad35d604.jpg" alt="logo" width="48px" height="48px">
        </div>
        <div class="title">
          <h1>电网建设造价模拟系统</h1>
        </div>
      </a-space>
      <div class="menu-container">
        <ul class="menu">
          <li class="menu-item" @click="router.push('/')">
            <div class="icon"><HomeOutlined /></div>
            主页
          </li>
          <li class="menu-item" @click="router.push('/team')">
            <div class="icon"><TeamOutlined /></div>
            团队
          </li>
          <li class="menu-item" @click="handleMenuClick">
            <div class="icon"><BookOutlined /></div>
            创作历程
          </li>
        </ul>
      </div>
    </a-layout-header>
    <a-layout-content style="padding: 18px 50px">
      <slot name="content"></slot>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      The Boil Poets Department ©2025 Created by JavierChen
    </a-layout-footer>
  </a-layout>
</template>

<script lang="ts" setup>

import router from "@/router";
import { HomeOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons-vue';


const handleMenuClick = () => {
  location.href = 'https://www.yuque.com/javierchen/ced583/gvipqcbwbq0zbv0z?singleDoc';
}
</script>

<style scoped>
.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #6A4C93, #5F4B8B); /* 渐变背景柔和一些 */
  padding: 0 20px;
}

.header-space {
  display: flex;
  align-items: center;
}

.logo img {
  transition: transform 0.3s ease-in-out;
}

.logo img:hover {
  transform: scale(1.1); /* Logo 放大效果 */
}

.title h1 {
  font-size: 24px;
  color: white;
  font-weight: bold;
  margin: 0;
  transition: color 0.3s ease-in-out;
}

.title h1:hover {
  color: #FFD700; /* 网站标题悬停效果 */
}

.menu-container {
  position: absolute;
  right: 20px;
}

.menu {
  display: flex;
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  font-size: 16px;
  color: #D1D1D1;
  margin-left: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.menu-item:hover {
  background-color: #B39DDB; /* 更柔和的悬停背景色 */
  color: #fff; /* 悬停时文字颜色 */
}

.menu-item-selected {
  background-color: #7E57C2 !important; /* 选中项背景色，深紫色 */
  color: #fff !important; /* 选中项字体颜色 */
}

.icon {
  margin-right: 10px;
}

</style>
