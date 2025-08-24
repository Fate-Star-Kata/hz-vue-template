# HzAdmin 系统接口文档

## 1. 认证相关接口 (hzadmin/client/auth/)

- `POST /hzadmin/client/auth/login/` - 用户登录//--
- `POST /hzadmin/client/auth/register/` - 用户注册//--
- `POST /hzadmin/client/auth/logout/` - 用户登出
- `GET /hzadmin/client/auth/userinfo/` - 获取用户信息//--
- `POST /hzadmin/client/auth/changepassword/` - 修改密码//--
- `GET /hzadmin/client/auth/captcha/` - 获取验证码//--
- `POST /hzadmin/client/auth/update_userinfo/` - 修改用户信息//--
- `POST /hzadmin/client/auth/reset_password/` - 重置密码//--

## 2. 公共接口 (hzadmin/client/public/)

- `POST /hzadmin/client/public/upload_file/` - 文件上传//--
- `POST /hzadmin/client/public/send_email_code/` - 发送邮箱验证码
- `GET /hzadmin/client/public/user_files/` - 获取用户文件列表
- `GET /hzadmin/client/public/user_files/<int:file_id>/` - 获取用户文件详情
- `DELETE /hzadmin/client/public/user_files/delete/` - 删除用户文件

## 3. 通知相关接口 (hzadmin/client/notification/)

- `GET /hzadmin/client/notification/list/` - 获取通知列表//--
- `GET /hzadmin/client/notification/detail/<int:notification_id>/` - 获取通知详情//--
- `POST /hzadmin/client/notification/read/` - 标记通知已读//--
- `POST /hzadmin/client/notification/read_all/` - 标记所有通知已读//--

## 4. 系统监控接口 (hzadmin/client/monitor/)

- `GET /hzadmin/client/monitor/cpu/` - CPU监控//--
- `GET /hzadmin/client/monitor/memory/` - 内存监控//--
- `GET /hzadmin/client/monitor/disk/` - 磁盘监控//--
- `GET /hzadmin/client/monitor/network/` - 网络监控//--
- `GET /hzadmin/client/monitor/process/` - 进程监控//--
- `GET /hzadmin/client/monitor/gpu/` - GPU监控//--
- `GET /hzadmin/client/monitor/overview/` - 系统概览//--

## 5. AI助手接口 (hzadmin/client/ai/)

- `GET /hzadmin/client/ai/chats/` - 获取聊天列表
- `POST /hzadmin/client/ai/chats/create/` - 创建聊天
- `GET /hzadmin/client/ai/chats/<int:chat_id>/` - 获取聊天详情
- `PUT /hzadmin/client/ai/chats/<int:chat_id>/update/` - 更新聊天
- `POST /hzadmin/client/ai/chats/<int:chat_id>/message/` - 发送消息
- `DELETE /hzadmin/client/ai/chats/delete/` - 删除聊天

## 6. 管理员接口 (hzadmin/admin/)

### 6.1 用户管理 (hzadmin/admin/user/)

- `GET /hzadmin/admin/user/users/` - 获取用户列表
- `GET /hzadmin/admin/user/users/<int:user_id>/` - 获取用户详情
- `POST /hzadmin/admin/user/users/addUser/` - 添加用户
- `PUT /hzadmin/admin/user/users/editUser/<int:user_id>/` - 编辑用户
- `POST /hzadmin/admin/user/users/status/` - 修改用户状态
- `DELETE /hzadmin/admin/user/users/delete/` - 删除用户
- `POST /hzadmin/admin/user/users/role/` - 修改用户角色

### 6.2 验证码管理 (hzadmin/admin/captcha/)

- `GET /hzadmin/admin/captcha/captchas/` - 获取验证码列表
- `DELETE /hzadmin/admin/captcha/captchas/clear/` - 清除验证码
- `GET /hzadmin/admin/captcha/redis-captchas/` - 获取Redis验证码列表
- `DELETE /hzadmin/admin/captcha/redis-captchas/clear/` - 清除Redis验证码

### 6.3 系统配置管理 (hzadmin/admin/config/)

- `GET /hzadmin/admin/config/configs/` - 获取配置列表
- `GET /hzadmin/admin/config/configs/<int:config_id>/` - 获取配置详情
- `GET /hzadmin/admin/config/configs/email/` - 获取邮箱配置
- `GET /hzadmin/admin/config/configs/captcha/` - 获取验证码配置

### 6.4 通知管理 (hzadmin/admin/notification/)

- `GET /hzadmin/admin/notification/list/` - 获取通知列表
- `GET /hzadmin/admin/notification/detail/<int:notification_id>/` - 获取通知详情
- `POST /hzadmin/admin/notification/create/` - 创建通知
- `PUT /hzadmin/admin/notification/update/<int:notification_id>/` - 更新通知
- `DELETE /hzadmin/admin/notification/delete/` - 删除通知
- `POST /hzadmin/admin/notification/send_email/` - 发送邮件通知
- `GET /hzadmin/admin/notification/stats/` - 获取通知统计