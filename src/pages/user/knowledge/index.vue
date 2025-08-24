<template>
  <div class="min-h-screen bg-base-100 text-base-content flex flex-col">
    <!-- Hero：知识库标题 -->
    <section class="pt-24 pb-16 flex items-center justify-center">
      <div class="max-w-4xl w-full px-4 text-center space-y-6">
        <RevealMotion :delay="0">
          <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">
            知识库
          </h1>
        </RevealMotion>

        <RevealMotion :delay="0.1">
          <p class="text-lg md:text-xl opacity-70">
            探索丰富的知识内容，提升您的技能与见解
          </p>
        </RevealMotion>

        <RevealMotion :delay="0.2">
          <div class="flex items-center justify-center gap-3 pt-2">
            <div class="form-control w-full max-w-md">
              <div class="join w-full">
                <input 
                  type="text" 
                  placeholder="搜索文章..." 
                  class="input input-bordered join-item flex-1" 
                  v-model="searchQuery"
                  @input="handleSearch"
                />
                <button class="btn btn-primary join-item">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </RevealMotion>
      </div>
    </section>

    <!-- 分类标签 -->
    <section class="py-8 bg-base-200">
      <div class="max-w-6xl mx-auto px-4">
        <RevealMotion :delay="0">
          <div class="flex flex-wrap justify-center gap-2">
            <button 
              v-for="category in categories" 
              :key="category"
              class="btn btn-sm rounded-full"
              :class="selectedCategory === category ? 'btn-primary' : 'btn-outline'"
              @click="selectCategory(category)"
            >
              {{ category }}
            </button>
          </div>
        </RevealMotion>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="py-16">
      <div class="max-w-6xl mx-auto px-4">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RevealMotion v-for="(article, i) in filteredArticles" :key="article.id" :delay="i * 0.08">
            <div 
              class="card bg-base-100 shadow-sm hover:shadow-md transition rounded-2xl cursor-pointer transform hover:scale-105"
              @click="openArticle(article)"
            >
              <figure class="px-6 pt-6">
                <div class="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </figure>
              <div class="card-body">
                <h3 class="card-title text-base">{{ article.title }}</h3>
                <p class="opacity-70 text-sm line-clamp-3">{{ article.summary }}</p>
                <div class="card-actions justify-between items-center mt-4">
                  <div class="flex gap-1">
                    <span class="badge badge-outline badge-sm">{{ article.category }}</span>
                  </div>
                  <div class="text-xs opacity-50">{{ article.date }}</div>
                </div>
              </div>
            </div>
          </RevealMotion>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredArticles.length === 0" class="text-center py-16">
          <RevealMotion :delay="0">
            <div class="opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-lg">暂无相关文章</p>
            </div>
          </RevealMotion>
        </div>
      </div>
    </section>

    <!-- 文章详情弹窗 -->
    <dialog ref="articleModal" class="modal">
      <div class="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <div v-if="selectedArticle" class="space-y-6">
          <div class="space-y-2">
            <h3 class="font-bold text-2xl">{{ selectedArticle.title }}</h3>
            <div class="flex items-center gap-4 text-sm opacity-70">
              <span class="badge badge-outline">{{ selectedArticle.category }}</span>
              <span>{{ selectedArticle.date }}</span>
              <span>阅读时间: {{ selectedArticle.readTime }}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="prose max-w-none">
            <div v-html="selectedArticle.content"></div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button type="button" @click="closeModal">close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { h, defineComponent, onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Motion } from "motion-v";

// RevealMotion 组件定义（复用首页的动画组件）
type RevealProps = { delay?: number };
const RevealMotion = defineComponent<RevealProps>({
  name: "RevealMotion",
  props: { delay: { type: Number, default: 0 } },
  setup(props, { slots }) {
    const el = ref<HTMLElement | null>(null);
    const inView = ref(false);
    let io: IntersectionObserver | null = null;

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
        { ref: el },
        [
          h(
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

// 响应式数据
const searchQuery = ref('');
const selectedCategory = ref('全部');
const selectedArticle = ref(null);
const articleModal = ref<HTMLDialogElement | null>(null);

// 分类数据
const categories = ['全部', '技术文档', '最佳实践', '教程指南', '案例分析', '工具使用'];

// 模拟文章数据
const articles = ref([
  {
    id: 1,
    title: 'Vue 3 组合式 API 完全指南',
    summary: '深入了解 Vue 3 的组合式 API，包括 setup 函数、响应式系统和生命周期钩子的使用方法。',
    category: '技术文档',
    date: '2024-01-15',
    readTime: '8分钟',
    content: `
      <h2>什么是组合式 API？</h2>
      <p>组合式 API 是 Vue 3 中引入的一套新的 API，它提供了一种更灵活的方式来组织组件逻辑。</p>
      
      <h3>主要特性</h3>
      <ul>
        <li>更好的逻辑复用</li>
        <li>更好的类型推导</li>
        <li>更小的生产包体积</li>
        <li>更好的 Tree-shaking 支持</li>
      </ul>
      
      <h3>基本用法</h3>
      <pre><code>import { ref, reactive, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    return {
      count,
      doubleCount
    }
  }
}</code></pre>
    `
  },
  {
    id: 2,
    title: 'TypeScript 最佳实践',
    summary: '在现代前端开发中使用 TypeScript 的最佳实践，包括类型定义、接口设计和错误处理。',
    category: '最佳实践',
    date: '2024-01-12',
    readTime: '12分钟',
    content: `
      <h2>TypeScript 最佳实践</h2>
      <p>TypeScript 为 JavaScript 添加了静态类型检查，帮助开发者在编译时发现错误。</p>
      
      <h3>类型定义</h3>
      <p>始终为函数参数和返回值定义明确的类型。</p>
      
      <h3>接口设计</h3>
      <p>使用接口来定义对象的结构，提高代码的可读性和维护性。</p>
    `
  },
  {
    id: 3,
    title: 'Tailwind CSS 响应式设计',
    summary: '学习如何使用 Tailwind CSS 创建响应式布局，掌握断点系统和移动优先的设计理念。',
    category: '教程指南',
    date: '2024-01-10',
    readTime: '6分钟',
    content: `
      <h2>Tailwind CSS 响应式设计</h2>
      <p>Tailwind CSS 提供了强大的响应式设计工具。</p>
      
      <h3>断点系统</h3>
      <ul>
        <li>sm: 640px</li>
        <li>md: 768px</li>
        <li>lg: 1024px</li>
        <li>xl: 1280px</li>
      </ul>
    `
  },
  {
    id: 4,
    title: 'DaisyUI 组件库使用指南',
    summary: '探索 DaisyUI 组件库的强大功能，学习如何快速构建美观的用户界面。',
    category: '工具使用',
    date: '2024-01-08',
    readTime: '10分钟',
    content: `
      <h2>DaisyUI 组件库</h2>
      <p>DaisyUI 是基于 Tailwind CSS 的组件库，提供了丰富的预设计组件。</p>
      
      <h3>主要组件</h3>
      <ul>
        <li>按钮 (Button)</li>
        <li>卡片 (Card)</li>
        <li>模态框 (Modal)</li>
        <li>导航栏 (Navbar)</li>
      </ul>
    `
  },
  {
    id: 5,
    title: '前端性能优化案例分析',
    summary: '通过实际案例分析前端性能优化的方法和技巧，包括代码分割、懒加载和缓存策略。',
    category: '案例分析',
    date: '2024-01-05',
    readTime: '15分钟',
    content: `
      <h2>前端性能优化</h2>
      <p>性能优化是前端开发中的重要环节。</p>
      
      <h3>优化策略</h3>
      <ul>
        <li>代码分割</li>
        <li>懒加载</li>
        <li>缓存策略</li>
        <li>图片优化</li>
      </ul>
    `
  },
  {
    id: 6,
    title: 'Git 工作流最佳实践',
    summary: '掌握 Git 分支管理和团队协作的最佳实践，提高开发效率和代码质量。',
    category: '最佳实践',
    date: '2024-01-03',
    readTime: '9分钟',
    content: `
      <h2>Git 工作流</h2>
      <p>良好的 Git 工作流对团队协作至关重要。</p>
      
      <h3>分支策略</h3>
      <ul>
        <li>主分支 (main/master)</li>
        <li>开发分支 (develop)</li>
        <li>功能分支 (feature)</li>
        <li>修复分支 (hotfix)</li>
      </ul>
    `
  }
]);

// 计算属性：过滤文章
const filteredArticles = computed(() => {
  let result = articles.value;
  
  // 按分类过滤
  if (selectedCategory.value !== '全部') {
    result = result.filter(article => article.category === selectedCategory.value);
  }
  
  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// 方法
const selectCategory = (category: string) => {
  selectedCategory.value = category;
};

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
};

const openArticle = (article: any) => {
  selectedArticle.value = article;
  articleModal.value?.showModal();
};

const closeModal = () => {
  articleModal.value?.close();
};
</script>

<style scoped>
/* 保持干净的滚动体验 */
html,
body {
  scroll-behavior: smooth;
}

/* 文本截断样式 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 代码块样式 */
.prose pre {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>