import type { AdminHeader } from '@/types/factory'
import type { MenuItem } from '@/types/components/header'
import { defineAsyncComponent } from 'vue';

//获得资源服务地址
const FileUploadUrl: string = (import.meta.env.VITE_FILE_UPLOAD_URL as string)
  .startsWith("http") ? import.meta.env.VITE_FILE_UPLOAD_URL : window.location.protocol + "//" + window.location.host + "/api" + import.meta.env.VITE_FILE_UPLOAD_URL;

let VITE_APP_LOGO

try {
  VITE_APP_LOGO = defineAsyncComponent(() =>
    import(`@/components/icon/${import.meta.env.VITE_APP_LOGO}.vue`)
  )
} catch {
  VITE_APP_LOGO = null
}

// 主菜单配置（用于Header组件）
export const defaultMenuItems: MenuItem[] = [
  {
    id: 'index',
    label: 'menu.index',
    href: '/',
    icon: null,
    hide: false,
  },
  {
    id: 'stats',
    label: 'menu.stats',
    href: '/user/stats',
    icon: null,
    hide: true,
  },
  {
    id: 'knowledge',
    label: '知识库',
    href: '/user/knowledge',
    icon: null,
  },
]

// 管理后台菜单配置
export const adminMenuItems: AdminHeader[] = [
  {
    id: "1",
    title: "仪表板",
    icon: "Odometer",
    path: "/admin/dashboard",
  },
  {
    id: "2",
    title: "用户管理",
    icon: "User",
    path: "/admin/userManage",
    // children: [
    //   { id: '2-1', title: '用户列表', icon: 'UserFilled', path: '/admin/userManage' },
    // ]
  },
  {
    id: "3",
    title: "通知管理",
    icon: "Bell",
    path: "/admin/notice",
  },
  {
    id: "4",
    title: "知识管理",
    icon: "Document",
    path: "/admin/knowledge",
  },
  {
    id: "5",
    title: "订单管理",
    icon: "ShoppingCart",
    path: "/admin/orders",
    hide: true,
    children: [
      {
        id: "4-1",
        title: "订单列表",
        icon: "List",
        path: "/admin/orders/list",
      },
      {
        id: "4-2",
        title: "退款管理",
        icon: "RefreshLeft",
        path: "/admin/orders/refunds",
      },
    ],
  },
  {
    id: "6",
    title: "文件系统",
    icon: "FolderChecked",
    path: "/admin/files",
  },
  {
    id: '6',
    title: 'AI 助手',
    icon: 'ChatDotRound',
    path: '/admin/ai',
    hide: true
  },
  {
    id: '7',
    title: '财务管理',
    icon: 'Money',
    path: '/admin/finance',
    hide: true,
    children: [
      {
        id: "8-1",
        title: "收支明细",
        icon: "Wallet",
        path: "/admin/finance/transactions",
      },
      {
        id: "8-2",
        title: "财务报表",
        icon: "DataAnalysis",
        path: "/admin/finance/reports",
      },
    ],
  },
  {
    id: "9",
    title: "系统设置",
    icon: "Setting",
    path: "/admin/settings",
    hide: true,
    children: [
      {
        id: "9-1",
        title: "基础设置",
        icon: "Tools",
        path: "/admin/settings/basic",
      },
      {
        id: "9-2",
        title: "权限管理",
        icon: "Key",
        path: "/admin/settings/permissions",
      },
      {
        id: "9-3",
        title: "系统日志",
        icon: "DocumentCopy",
        path: "/admin/settings/logs",
      },
    ],
  },
  {
    id: "10",
    title: "操作日志",
    icon: "DocumentCopy",
    path: "/admin/log",
  },
  {
    id: "11",
    title: "系统配置",
    icon: "Tools",
    path: "/admin/systemConfig",
  },
];

const serverConfig = {
  baseURL: '/api', // 请求基础地址,可根据环境自定义

  useTokenAuthorization: false, // 是否开启 token 认证

  FileUploadUrl,

  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,

  VITE_APP_LOGO: VITE_APP_LOGO ? VITE_APP_LOGO : () => null,

  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,

  SERVER_PATH: import.meta.env.VITE_SERVER_PATH || '/api',

  WEBSOCKET_PATH: import.meta.env.VITE_WEBSOCKET_PATH || '/api',
}
export default serverConfig
