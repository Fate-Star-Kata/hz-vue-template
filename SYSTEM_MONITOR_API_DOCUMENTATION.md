# 系统监控接口文档

## 概述

系统监控模块提供了全面的服务器资源监控功能，包括CPU、内存、磁盘、网络、进程、GPU等系统指标的实时监控。所有接口都基于 Django REST Framework 构建，支持 JSON 格式的数据交互。

## 基础信息

- **基础URL**: `/api/hzadmin/monitor/`
- **认证方式**: Session Authentication / Token Authentication
- **数据格式**: JSON
- **权限要求**: 所有接口都需要用户登录认证
- **响应格式**: 统一使用 R 类封装响应

### 响应格式说明

```json
{
    "success": true/false,
    "msg": "响应消息",
    "data": {}, // 响应数据
    "code": 200 // 状态码
}
```

---

## 接口列表

### 1. CPU监控

- **接口**: `GET /api/hzadmin/monitor/cpu/`
- **权限**: 需要认证
- **功能**: 获取CPU使用率、核心数、频率等信息
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "cpu_percent": [15.2, 12.8, 18.5, 10.3],
        "cpu_count": 4,
        "cpu_freq": {
            "current": 2400.0,
            "min": 800.0,
            "max": 3200.0
        },
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

### 2. 内存监控

- **接口**: `GET /api/hzadmin/monitor/memory/`
- **权限**: 需要认证
- **功能**: 获取内存和交换分区使用情况
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "memory": {
            "total": 8589934592,
            "available": 4294967296,
            "used": 4294967296,
            "percent": 50.0
        },
        "swap": {
            "total": 2147483648,
            "used": 536870912,
            "free": 1610612736,
            "percent": 25.0
        },
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

### 3. 磁盘监控

- **接口**: `GET /api/hzadmin/monitor/disk/`
- **权限**: 需要认证
- **功能**: 获取所有磁盘分区的使用情况
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "disk_info": [
            {
                "device": "C:\\",
                "mountpoint": "C:\\",
                "fstype": "NTFS",
                "total": 107374182400,
                "used": 53687091200,
                "free": 53687091200,
                "percent": 50.0
            },
            {
                "device": "D:\\",
                "mountpoint": "D:\\",
                "fstype": "NTFS",
                "total": 214748364800,
                "used": 64424509440,
                "free": 150323855360,
                "percent": 30.0
            }
        ],
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

### 4. 网络监控

- **接口**: `GET /api/hzadmin/monitor/network/`
- **权限**: 需要认证
- **功能**: 获取网络接口的流量统计
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "network_info": {
            "bytes_sent": 1073741824,
            "bytes_recv": 2147483648,
            "packets_sent": 1000000,
            "packets_recv": 1500000,
            "errin": 0,
            "errout": 0,
            "dropin": 0,
            "dropout": 0
        },
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

### 5. 进程监控

- **接口**: `GET /api/hzadmin/monitor/process/`
- **权限**: 需要认证
- **功能**: 获取系统进程列表和资源占用情况
- **参数**:
  - `limit`: 返回进程数量限制（默认10）
  - `sort_by`: 排序字段（cpu_percent/memory_percent，默认cpu_percent）
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "processes": [
            {
                "pid": 1234,
                "name": "python.exe",
                "cpu_percent": 15.5,
                "memory_percent": 8.2,
                "memory_info": {
                    "rss": 134217728,
                    "vms": 268435456
                },
                "status": "running",
                "create_time": "2025-01-18 10:00:00"
            }
        ],
        "total_processes": 156,
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

### 6. GPU监控

- **接口**: `GET /api/hzadmin/monitor/gpu/`
- **权限**: 需要认证
- **功能**: 获取GPU使用情况（需要安装GPUtil库）
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "gpu_available": true,
        "gpu_info": [
            {
                "id": 0,
                "name": "NVIDIA GeForce RTX 3080",
                "load": 0.45,
                "memory_used": 4096,
                "memory_total": 10240,
                "memory_util": 0.4,
                "temperature": 65
            }
        ],
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

**注意**: 如果系统未安装GPUtil库，将返回：
```json
{
    "success": true,
    "data": {
        "gpu_available": false,
        "message": "GPU监控库未安装",
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

### 7. 系统概览

- **接口**: `GET /api/hzadmin/monitor/overview/`
- **权限**: 需要认证
- **功能**: 获取系统整体运行状态概览
- **响应示例**:
```json
{
    "success": true,
    "data": {
        "system_info": {
            "platform": "Windows-10-10.0.19041-SP0",
            "processor": "Intel64 Family 6 Model 142 Stepping 10, GenuineIntel",
            "architecture": "64bit",
            "hostname": "DESKTOP-ABC123",
            "boot_time": "2025-01-18 08:00:00",
            "uptime": "6:30:25"
        },
        "resource_summary": {
            "cpu_percent": 15.2,
            "memory_percent": 50.0,
            "disk_percent": 40.0,
            "network_bytes_sent": 1073741824,
            "network_bytes_recv": 2147483648
        },
        "alerts": [
            {
                "type": "warning",
                "message": "内存使用率超过80%",
                "value": 85.5
            }
        ],
        "timestamp": "2025-01-18 14:30:25"
    }
}
```

---

## 数据单位说明

### 内存和磁盘容量
- 所有容量数据以字节（bytes）为单位
- 1 KB = 1024 bytes
- 1 MB = 1024 KB
- 1 GB = 1024 MB

### CPU频率
- 以MHz为单位
- 1 GHz = 1000 MHz

### 网络流量
- bytes_sent/bytes_recv: 发送/接收的字节数
- packets_sent/packets_recv: 发送/接收的数据包数

### 百分比
- 所有百分比数据范围为 0.0 - 100.0
- 保留一位小数

---

## 使用示例

### JavaScript 示例

```javascript
// 获取CPU监控数据
fetch('/api/hzadmin/monitor/cpu/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('CPU使用率:', data.data.cpu_percent);
        console.log('CPU核心数:', data.data.cpu_count);
    }
});

// 获取系统概览
fetch('/api/hzadmin/monitor/overview/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        const summary = data.data.resource_summary;
        console.log('系统资源概览:', {
            cpu: summary.cpu_percent + '%',
            memory: summary.memory_percent + '%',
            disk: summary.disk_percent + '%'
        });
    }
});
```

### Python 示例

```python
import requests

# 获取内存监控数据
response = requests.get('http://localhost:8000/api/hzadmin/monitor/memory/')
if response.json()['success']:
    memory_data = response.json()['data']['memory']
    print(f"内存使用率: {memory_data['percent']}%")
    print(f"可用内存: {memory_data['available'] / 1024 / 1024 / 1024:.2f} GB")

# 获取磁盘监控数据
response = requests.get('http://localhost:8000/api/hzadmin/monitor/disk/')
if response.json()['success']:
    disk_info = response.json()['data']['disk_info']
    for disk in disk_info:
        print(f"磁盘 {disk['device']}: {disk['percent']}% 已使用")
```

### curl 示例

```bash
# 获取CPU监控数据
curl -X GET "http://localhost:8000/api/hzadmin/monitor/cpu/" \
     -H "Content-Type: application/json" \
     -b "sessionid=your_session_id"

# 获取进程监控数据（限制返回5个进程，按内存使用率排序）
curl -X GET "http://localhost:8000/api/hzadmin/monitor/process/?limit=5&sort_by=memory_percent" \
     -H "Content-Type: application/json" \
     -b "sessionid=your_session_id"
```

---

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 401 | 未认证 | 请先登录获取有效的会话或Token |
| 403 | 权限不足 | 确保用户有访问系统监控的权限 |
| 500 | 服务器内部错误 | 检查服务器日志，可能是系统资源获取失败 |

### 错误响应示例

```json
{
    "success": false,
    "msg": "用户未登录",
    "code": 401
}
```

---

## 性能优化建议

### 1. 请求频率控制
- 建议监控数据刷新间隔不少于1秒
- 对于实时性要求不高的数据（如磁盘使用率），可以5-10秒刷新一次

### 2. 数据缓存
- 前端可以实现本地缓存，避免频繁请求相同数据
- 服务端已实现适当的缓存机制

### 3. 按需获取
- 根据实际需要选择性获取监控数据
- 避免同时请求所有监控接口

---

## 故障排除

### 1. GPU监控不可用

**问题**: GPU监控接口返回 `gpu_available: false`

**原因**: 系统未安装GPUtil库

**解决方案**:
```bash
pip install GPUtil
```

### 2. 进程监控数据不完整

**问题**: 某些进程信息获取失败

**原因**: 权限不足或进程已结束

**解决方案**: 以管理员权限运行Django服务

### 3. 网络监控数据异常

**问题**: 网络流量数据显示异常

**原因**: 系统网络接口配置问题

**解决方案**: 检查系统网络配置，重启网络服务

---

## 更新日志

- **v1.0.1**: 修复系统监控接口404错误，添加`/api/hzadmin/`路由支持
- **v1.0.0**: 初始版本，包含CPU、内存、磁盘、网络、进程、GPU和系统概览监控功能

---

*文档生成时间: 2025-01-18*
*API版本: v1.0.1*