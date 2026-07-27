# SuperCV Backend

SuperCV 的后端服务，提供用户认证、简历与模板管理、AI 简历解析/优化、会员权益、商品订单、文章、对象存储临时凭证及后台管理等能力。

> 练习来源：[CodeCrush #8228](https://www.codecrush.cn/practice/8228)

## 技术栈

- Java 17、Spring Boot 3.0
- Gradle Wrapper 8.11
- MyBatis、MySQL 8、Druid
- Springdoc OpenAPI / Swagger UI
- H2（自动化测试）
- 阿里云 OSS / STS / 短信、腾讯云验证码、微信支付、通义千问

## 项目结构

这是一个 Gradle 多模块项目；根模块负责启动应用和统一 Web 配置。

| 模块 | 职责 |
| --- | --- |
| `src` | Spring Boot 启动类、全局响应/异常处理、过滤器、拦截器与 OpenAPI 配置 |
| `common` | 通用工具、断言和业务异常 |
| `user` | 用户、登录、Token、短信验证码与微信登录 |
| `resume` | 简历、模板、简历文件解析与 AI 优化 |
| `vip` | 会员与权益校验 |
| `product` / `order` | 商品、订单、支付渠道与支付回调 |
| `article` | 文章及文章内容管理 |
| `oss` | 阿里云 STS 临时访问凭证 |
| `llm` | 大模型接入、模型配置与调用日志 |
| `admin` | 管理员、后台数据统计及各业务后台管理接口 |
| `event` | 应用内事件定义 |

## 本地运行

### 1. 准备环境

- JDK 17
- MySQL 8（或兼容 MySQL 协议的数据库，可使用mysql_secure_installation安全固件）
- 网络可访问 Maven Central（首次运行 Gradle 会下载依赖）

仓库包含 Gradle Wrapper，无需预先安装 Gradle。macOS/Linux 上如果 Wrapper 没有执行权限，可执行：

```bash
chmod +x gradlew
```

### 2. 初始化数据库

创建本地开发数据库，并导入项目提供的初始化脚本：

```bash
mysql -u root -p -e 'CREATE DATABASE supercv_db_dev DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
mysql -u root -p supercv_db_dev < src/main/resources/supercv.sql
```

### 3. 配置开发环境

开发配置位于 [application-dev.yaml](src/main/resources/application-dev.yaml)，默认启用 `dev` profile。至少需要将以下数据源配置改为本机可用的值：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/supercv_db_dev?serverTimezone=Asia/Shanghai&useUnicode=true
    username: your_mysql_user
    password: your_mysql_password
```

也可通过启动参数覆盖，避免把本地密码写入仓库：

```bash
./gradlew bootRun --args='--spring.datasource.username=your_mysql_user --spring.datasource.password=your_mysql_password'
```

若要使用短信、微信登录、对象存储、验证码、微信支付或 AI 功能，还需在同一文件中填写对应的 `wxOpen`、`aliyun`、`sms`、`tencent`、`captcha`、`wxPay` 配置。未配置的第三方服务不能完成实际调用；普通的本地登录和多数不依赖这些服务的接口仍可用于联调。

**不要提交真实密钥、支付私钥或生产数据库密码。** 生产环境配置文件已被 `.gitignore` 忽略，可单独维护 `application-prod.yaml`。

### 4. 启动服务

```bash
./gradlew bootRun
```

默认端口为 `8088`，启动后访问：

- Druid 监控页：<http://localhost:8088/druid/index.html>（开发配置默认账号/密码：`admin` / `admin`；仅限本地开发）

应用日志及 Tomcat access log 输出到 `logs/`。

开发配置默认关闭了 OpenAPI JSON。如需使用 Swagger，在启动时追加以下参数：

```bash
./gradlew bootRun --args='--springdoc.api-docs.enabled=true'
```

随后访问 Swagger UI：<http://localhost:8088/swagger-ui/index.html>。

## API 使用说明

接口以 `/v1/**` 为用户端前缀，`/admin/**` 为管理端前缀。启用 OpenAPI 后，Swagger UI 会按 User、Login、Resume、Order、Payment、Article、Admin 等分组展示实际可用接口和参数。

受保护接口需要同时携带以下请求头：

```http
Authorization: Bearer <token>
uid: <user-id>
```

在 `dev` profile 下，可先通过开发登录接口取得 Token：

```bash
curl -X POST 'http://localhost:8088/v1/login/dev/telephone' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'telephone=13800138000'
```

示例：携带登录信息查询个人资料：

```bash
curl 'http://localhost:8088/v1/user/info' \
  -H 'Authorization: Bearer <token>' \
  -H 'uid: <user-id>'
```

大部分 `POST` 接口使用 `application/x-www-form-urlencoded` 提交参数。以 Swagger UI 的接口定义为准。

## 测试与构建

测试使用 `ut` profile 和内存 H2 数据库，无需启动 MySQL：

```bash
./gradlew test
```

执行完整校验并生成覆盖率报告：

```bash
./gradlew check
```

覆盖率报告位于 `build/reports/jacoco/testCodeCoverageReport/html/index.html`。构建可执行包：

```bash
./gradlew bootJar
```

生成的 JAR 位于 `build/libs/`，可按环境传入配置后运行：

```bash
java -jar build/libs/supercv-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

## 常见问题

| 现象 | 排查方向 |
| --- | --- |
| 服务启动时数据库连接失败 | 检查 MySQL 是否启动、数据库是否已创建，以及 `application-dev.yaml` 中的 URL、用户名和密码。 |
| 请求返回未登录或认证失败 | 确认同时传入有效的 `Authorization: Bearer <token>` 和 `uid` 请求头。 |
| 本地登录接口被拒绝 | 该接口仅允许 `dev`、`test` 或 `ut` profile。 |
| 调用第三方功能失败 | 检查相应服务的凭据、回调地址和网络连通性；占位配置不能用于真实调用。 |

## 贡献约定

提交前建议至少执行 `./gradlew test`。请不要提交 `build/`、`logs/`、本地 IDE 文件或任何密钥与凭据。
