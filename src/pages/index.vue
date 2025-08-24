<template>
  <div class="min-h-screen bg-base-100 text-base-content flex flex-col">
    <!-- Hero：中置标题 + 轻动画 -->
    <section class="pt-24 pb-16 flex items-center justify-center">
      <div class="max-w-3xl w-full px-4 text-center space-y-6">
        <RevealMotion :delay="0">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">
            TITLE
          </h1>
        </RevealMotion>

        <RevealMotion :delay="0.1">
          <p class="text-lg md:text-xl opacity-70">
            DESC
          </p>
        </RevealMotion>

        <RevealMotion :delay="0.2">
          <div class="flex items-center justify-center gap-3 pt-2">
            <a class="btn btn-primary rounded-full px-6">立即使用</a>
            <a class="btn btn-outline rounded-full px-6">了解更多</a>
          </div>
        </RevealMotion>
      </div>
    </section>

    <!-- 功能亮点：简洁卡片 -->
    <section id="features" class="py-16 bg-base-200">
      <div class="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RevealMotion v-for="(f, i) in features" :key="i" :delay="i * 0.08">
          <div class="card bg-base-100 shadow-sm hover:shadow-md transition rounded-2xl">
            <div class="card-body">
              <h3 class="card-title text-base">{{ f.title }}</h3>
              <p class="opacity-70 text-sm">{{ f.desc }}</p>
            </div>
          </div>
        </RevealMotion>
      </div>
    </section>

    <!-- 关于 -->
    <section id="about" class="py-16">
      <div class="max-w-4xl mx-auto px-4 space-y-4 text-center">
        <RevealMotion :delay="0">
          <h2 class="text-2xl md:text-3xl font-bold">TITLE</h2>
        </RevealMotion>
        <RevealMotion :delay="0.08">
          <p class="opacity-70">
            DESC
          </p>
        </RevealMotion>
      </div>
    </section>

    <!-- 联系/CTA -->
    <section id="contact" class="py-16 bg-base-200">
      <div class="max-w-xl mx-auto px-4 text-center space-y-4">
        <RevealMotion :delay="0">
          <h3 class="text-xl md:text-2xl font-semibold">准备好开始了吗？</h3>
        </RevealMotion>
        <RevealMotion :delay="0.08">
          <a class="btn btn-primary rounded-full px-8">联系我</a>
        </RevealMotion>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="border-t border-base-200 py-6 text-center text-sm opacity-70">
      © 2025 Your Company. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 动画说明：
 * - 使用你指定的 motion-v：import { Motion } from 'motion-v'
 * - RevealMotion 组件内部用 IntersectionObserver 监听进入视口
 * - 初始：opacity 0 + y 16；进入：opacity 1 + y 0
 */
import { h, defineComponent, onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Motion } from "motion-v";

type RevealProps = { delay?: number };
const RevealMotion = defineComponent<RevealProps>({
  name: "RevealMotion",
  props: { delay: { type: Number, default: 0 } },
  setup(props, { slots }) {
    const el = ref<HTMLElement | null>(null);
    const inView = ref(false);
    let io: IntersectionObserver | null = null;

    // 使用 computed 来确保响应式更新
    const animateProps = computed(() => {
      return inView.value
        ? { opacity: 1, y: 0, transition: { duration: 0.6, delay: props.delay } }
        : { opacity: 0, y: 16 };
    });

    onMounted(() => {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              inView.value = true;
              // 只动画一次，注释掉下一行可反复触发
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      if (el.value) io.observe(el.value);
    });

    onBeforeUnmount(() => io?.disconnect());

    return () =>
      h(
        "div",
        {
          ref: el,
        },
        [
          h(
            // Motion 组件：用 initial + animate
            Motion as any,
            {
              initial: { opacity: 0, y: 16 },
              animate: animateProps.value,
            },
            slots
          )
        ]
      );
  },
});

// 文案内容：保持中性，便于替换
const features = [
  { title: "极简设计", desc: "去除干扰，聚焦信息与层次。" },
  { title: "响应布局", desc: "桌面/移动端一致的体验。" },
  { title: "即插即用", desc: "替换文字与链接即可上线。" },
  { title: "轻量动画", desc: "只在需要处出现的动效。" },
  { title: "DaisyUI 组件", desc: "开箱即用的优雅样式。" },
  { title: "Tailwind 原子化", desc: "一致、可维护的样式体系。" },
];
</script>

<style scoped>
/* 保持干净的滚动体验 */
html,
body {
  scroll-behavior: smooth;
}

</style>
