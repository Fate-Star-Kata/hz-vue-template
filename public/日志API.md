# 全局公共参数

**全局Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**全局Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**全局Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**全局认证方式**

> 无需认证

# 状态码说明

| 状态码 | 中文描述 |
| --- | ---- |
| 暂无参数 |

# 日志

> 创建人: 0120suileyan

> 更新人: 0120suileyan

> 创建时间: 2025-08-24 16:14:36

> 更新时间: 2025-08-24 16:15:34

```text
暂无描述
```

**目录Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Cookie | csrftoken=yfkLzykD273y9wolRw3NY7v3urIAy02I; sessionid=vf62pgz9r0xh1nj8f8butc9hrdp6jk8q | string | 是 | - |

**目录Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录Body参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| 暂无参数 |

**目录认证信息**

> 继承父级

**请求Header参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| Cookie | csrftoken=yfkLzykD273y9wolRw3NY7v3urIAy02I; sessionid=vf62pgz9r0xh1nj8f8butc9hrdp6jk8q | string | 是 | - |

**Query**

## 获取操作日志列表

> 创建人: 0120suileyan

> 更新人: 0120suileyan

> 创建时间: 2025-08-24 16:15:53

> 更新时间: 2025-08-24 16:21:00

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /hzadmin/admin/operation/logs/

**请求方式**

> GET

**Content-Type**

> none

**请求Query参数**

| 参数名 | 示例值 | 参数类型 | 是否必填 | 参数描述 |
| --- | --- | ---- | ---- | ---- |
| search | - | string | 否 | 搜索关键词（描述、用户名、模块） |
| page | - | string | 否 | 页码，默认1 |
| page_size | - | string | 否 | 每页数量，默认20 |
| action_type | - | string | 否 | 操作类型（create/update/delete/view） |
| module | - | string | 否 | 模块名称 |
| user_id | - | string | 否 | 用户ID |
| start_date | - | string | 否 | 开始日期 |
| end_date | - | string | 否 | 结束日期 |

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{"code":200,"msg":null,"data":{"logs":[{"id":357,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:30"},{"id":356,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"delete","action_type_display":"删除","module":"用户文件","description":"删除文件","target_model":"FileUpload","target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:30"},{"id":355,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件详情","target_model":"FileUpload","target_id":9,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:18"},{"id":354,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:16"},{"id":353,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"delete","action_type_display":"删除","module":"用户文件","description":"删除文件","target_model":"FileUpload","target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:16"},{"id":352,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:08"},{"id":351,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"create","action_type_display":"创建","module":"文件上传","description":"上传文件","target_model":"FileUpload","target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:15:07"},{"id":350,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"知识文章","description":"查看文章统计","target_model":null,"target_id":null,"ip_address":"192.168.124.11","response_status":200,"created_at":"2025-08-24 16:14:56"},{"id":349,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"知识文章","description":"查看文章列表","target_model":null,"target_id":null,"ip_address":"192.168.124.11","response_status":200,"created_at":"2025-08-24 16:14:56"},{"id":348,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"知识库","description":"查看分类列表","target_model":null,"target_id":null,"ip_address":"192.168.124.11","response_status":200,"created_at":"2025-08-24 16:14:56"},{"id":347,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:49"},{"id":346,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"create","action_type_display":"创建","module":"文件上传","description":"上传文件","target_model":"FileUpload","target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:49"},{"id":345,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户通知","description":"查看通知列表","target_model":null,"target_id":null,"ip_address":"192.168.124.11","response_status":200,"created_at":"2025-08-24 16:14:07"},{"id":344,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"通知管理","description":"查看通知统计","target_model":null,"target_id":null,"ip_address":"192.168.124.11","response_status":200,"created_at":"2025-08-24 16:14:07"},{"id":343,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:05"},{"id":342,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"系统配置","description":"查看邮件配置","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:05"},{"id":341,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"用户文件","description":"查看文件列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:02"},{"id":340,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"知识文章","description":"查看文章统计","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:01"},{"id":339,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"知识文章","description":"查看文章列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:01"},{"id":338,"user":{"id":9,"username":"hhh","first_name":"hhh"},"action_type":"view","action_type_display":"查看","module":"知识库","description":"查看分类列表","target_model":null,"target_id":null,"ip_address":"192.168.124.14","response_status":200,"created_at":"2025-08-24 16:14:01"}],"pagination":{"current_page":1,"total_pages":18,"total_count":357,"page_size":20,"has_next":true,"has_previous":false},"filters":{"action_types":[["create","创建"],["update","更新"],["delete","删除"],["view","查看"],["login","登录"],["logout","登出"],["upload","上传"],["download","下载"],["other","其他"]],"modules":["用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","文件上传","知识文章","知识文章","知识库","用户文件","文件上传","用户通知","通知管理","用户文件","系统配置","用户文件","知识文章","知识文章","知识库","用户通知","通知管理","通知管理","用户通知","通知管理","用户通知","通知管理","用户管理","知识文章","知识库","用户管理","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","日志管理","用户通知","知识库","知识库","用户通知","知识库","知识库","知识库","知识库","知识库","知识库","知识库","知识库","用户通知","知识库","知识库","知识库","用户通知","用户通知","知识库","用户通知","用户通知","用户通知","用户通知","用户通知","用户文件","用户通知","通知管理","知识文章","知识库","用户文件","用户通知","通知管理","用户通知","通知管理","通知管理","用户通知","通知管理","用户文件","用户文件","用户通知","通知管理","用户通知","知识文章","知识文章","知识库","用户通知","用户通知","知识文章","知识文章","知识库","用户通知","知识文章","知识文章","知识库","用户通知","用户通知","用户通知","知识文章","知识文章","知识库","用户通知","用户通知","通知管理","通知管理","用户通知","用户通知","通知管理","通知管理","用户管理","用户管理","用户通知","用户通知","通知管理","通知管理","用户通知","用户通知","用户通知","通知管理","用户通知","用户通知","用户文件","通知管理","用户通知","用户通知","通知管理","文件上传","用户文件","文件上传","用户文件","知识文章","知识文章","知识库","用户通知","通知管理","用户管理","用户认证","用户管理","通知管理","用户通知","用户通知","用户通知","通知管理","用户通知","用户管理","用户管理","用户管理","用户通知","通知管理","用户通知","用户通知","用户通知","通知管理","用户通知","用户通知","用户认证","用户通知","用户通知","用户通知","用户通知","用户文件","用户文件","用户文件","文件上传","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","文件上传","用户文件","文件上传","用户文件","用户文件","文件上传","用户文件","文件上传","用户文件","用户文件","文件上传","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","用户文件","知识库","用户文件","用户文件","用户文件","用户文件","用户文件","用户通知","通知管理","用户通知","通知管理","用户通知","通知管理","用户通知","用户通知","通知管理","用户通知","用户通知","通知管理","用户管理","用户通知","通知管理","通知管理","用户通知","通知管理","知识文章","知识文章","通知管理","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识文章","知识库","通知管理","用户通知","用户认证","通知管理","通知管理","通知管理","系统配置","用户通知","通知管理","用户管理","用户通知","知识库","用户通知","用户通知","知识库","知识库","用户通知","用户通知","用户通知","知识库","知识库","用户通知","用户通知","通知管理","用户通知","通知管理","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","用户通知","知识库","知识库","知识库","知识库","用户通知","用户通知","用户通知","通知管理","用户管理","系统配置","通知管理","用户通知","用户管理","用户通知","用户通知","知识库","知识库","用户认证","用户认证","知识库","知识库","用户通知","用户通知","知识库","知识库","用户通知","用户通知","用户通知","用户通知","用户通知","知识库","知识库","用户通知","知识库","知识库","用户通知","知识库","知识库","用户通知","用户通知","用户通知","用户通知","知识文章","知识文章","用户通知","用户通知","知识文章","知识文章","用户通知","知识文章","用户通知","用户通知","用户通知","用户通知","用户通知","知识文章","知识文章","知识文章","用户通知","知识文章","知识文章","用户通知","用户通知","用户通知","用户通知","知识文章","知识文章","测试模块","测试模块","测试模块","系统管理","百科知识"]}}}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 获取指定日志

> 创建人: 0120suileyan

> 更新人: 0120suileyan

> 创建时间: 2025-08-24 16:18:53

> 更新时间: 2025-08-24 16:21:13

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /hzadmin/admin/operation/logs/350/

**请求方式**

> GET

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{"code":200,"msg":null,"data":{"id":350,"user":{"id":9,"username":"hhh","first_name":"hhh","email":""},"action_type":"view","action_type_display":"查看","module":"知识文章","description":"查看文章统计","target_model":null,"target_id":null,"ip_address":"192.168.124.11","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36","request_data":{},"response_status":200,"created_at":"2025-08-24 16:14:56"}}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 删除单个操作日志

> 创建人: 0120suileyan

> 更新人: 0120suileyan

> 创建时间: 2025-08-24 16:19:41

> 更新时间: 2025-08-24 16:19:41

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /hzadmin/admin/operation/logs/350/delete/

**请求方式**

> DELETE

**Content-Type**

> none

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{"code":200,"msg":null,"data":"成功删除操作日志: hhh的查看文章统计"}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 批量删除日志

> 创建人: 0120suileyan

> 更新人: 0120suileyan

> 创建时间: 2025-08-24 16:20:08

> 更新时间: 2025-08-24 16:20:28

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /hzadmin/admin/operation/logs/batch-delete/

**请求方式**

> POST

**Content-Type**

> json

**请求Body参数**

```javascript
{
  "log_ids": [1, 2, 3]
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
{"code":200,"msg":null,"data":"成功删除 3 条操作日志"}
```

* 失败(404)

```javascript
暂无数据
```

**Query**

## 根据指定天数或日期范围清空操作日志

> 创建人: 0120suileyan

> 更新人: 0120suileyan

> 创建时间: 2025-08-24 16:21:39

> 更新时间: 2025-08-24 16:21:51

```text
暂无描述
```

**接口状态**

> 开发中

**接口URL**

> /hzadmin/admin/operation/logs/clear/

**请求方式**

> GET

**Content-Type**

> json

**请求Body参数**

```javascript
{
  "days": 30,
  "start_date": "2025-01-01",
  "end_date": "2025-01-24"
}
```

**认证方式**

> 继承父级

**响应示例**

* 成功(200)

```javascript
暂无数据
```

* 失败(404)

```javascript
暂无数据
```

**Query**
