<script setup>
import signatureDishes from "../assets/signature-dishes.png";

const navLinks = [
  { label: "菜单", href: "#menu" },
  { label: "空间", href: "#story" },
  { label: "营业", href: "#hours" },
];

const highlights = [
  { stat: "18", text: "款每日更新菜品" },
  { stat: "7 min", text: "步行到江边夜景" },
  { stat: "36", text: "个安静舒适座位" },
];

const menuItems = [
  {
    number: "01",
    name: "番茄炖牛颊",
    description: "慢炖牛颊、烟熏番茄、烤蒜土豆泥",
    price: "¥99",
  },
  {
    number: "02",
    name: "青柠罗勒海鲈鱼",
    description: "脆皮海鲈鱼、罗勒油、柑橘沙拉",
    price: "¥116",
  },
  {
    number: "03",
    name: "焦糖布丁塔",
    description: "海盐焦糖、香草奶油、烤坚果碎",
    price: "¥48",
  },
];

const kitchenSchedule = [
  { time: "11:30", label: "午餐供应" },
  { time: "15:00", label: "咖啡与甜点" },
  { time: "18:00", label: "晚餐开席" },
];

const visitInfo = [
  {
    title: "地址",
    lines: ["上海市静安区梧桐路 128 号一层"],
  },
  {
    title: "营业时间",
    lines: ["周二至周日 11:30-22:30", "周一店休"],
  },
  {
    title: "订位",
    lines: ["电话 021-8866-1908", "微信 Hemubistro"],
    id: "reserve",
  },
];
</script>

<template>
  <header class="site-header" aria-label="主导航">
    <a class="brand" href="#top" aria-label="禾木小馆首页">
      <span class="brand-mark">禾</span>
      <span>禾木小馆</span>
    </a>
    <nav class="nav-links" aria-label="页面导航">
      <a v-for="link in navLinks" :key="link.href" :href="link.href">
        {{ link.label }}
      </a>
    </nav>
    <a class="header-action" href="#reserve">订位</a>
  </header>

  <main id="top">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-media" role="img" aria-label="温暖灯光下的餐桌和招牌料理"></div>
      <div class="hero-content">
        <p class="eyebrow">Seasonal Bistro</p>
        <h1 id="hero-title">禾木小馆</h1>
        <p class="hero-copy">
          用当季食材做一桌松弛又认真吃的饭。午后有手作轻食，夜晚供应炭烤主菜、自然酒和刚出炉的甜点。
        </p>
        <div class="hero-actions" aria-label="主要操作">
          <a class="button primary" href="#reserve">预约餐位</a>
          <a class="button secondary" href="#menu">查看菜单</a>
        </div>
      </div>
    </section>

    <section class="intro" aria-label="餐馆亮点">
      <div v-for="item in highlights" :key="item.stat">
        <span class="stat">{{ item.stat }}</span>
        <p>{{ item.text }}</p>
      </div>
    </section>

    <section class="section menu-section" id="menu" aria-labelledby="menu-title">
      <div class="section-heading">
        <p class="eyebrow">招牌推荐</p>
        <h2 id="menu-title">推荐菜品</h2>
        <p>从清爽开胃菜到适合分享的主菜，菜单跟着市场和季节微调。</p>
      </div>
      <div class="menu-layout">
        <img :src="signatureDishes" alt="三款招牌菜插画" />
        <div class="menu-list" aria-label="推荐菜品">
          <article v-for="item in menuItems" :key="item.number">
            <span>{{ item.number }}</span>
            <div>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <strong>{{ item.price }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="section story-section" id="story" aria-labelledby="story-title">
      <div class="story-copy">
        <p class="eyebrow">Dining Room</p>
        <h2 id="story-title">适合慢慢坐下来的小馆</h2>
        <p>
          开放式厨房保留一点烟火气，餐区用木质长桌、低照度吊灯和半开放座位安排，让约会、朋友小聚或一个人的晚餐都自在。
        </p>
      </div>
      <div class="story-panel">
        <p>今日厨房节奏</p>
        <ul>
          <li v-for="item in kitchenSchedule" :key="item.time">
            <span>{{ item.time }}</span>
            {{ item.label }}
          </li>
        </ul>
      </div>
    </section>

    <section class="section visit-section" id="hours" aria-labelledby="visit-title">
      <div>
        <p class="eyebrow">Visit</p>
        <h2 id="visit-title">来吃一顿刚刚好的晚餐</h2>
      </div>
      <div class="visit-grid">
        <article v-for="item in visitInfo" :id="item.id" :key="item.title">
          <h3>{{ item.title }}</h3>
          <p>
            <template v-for="(line, index) in item.lines" :key="line">
              <br v-if="index > 0" />
              {{ line }}
            </template>
          </p>
        </article>
      </div>
    </section>
  </main>
</template>
