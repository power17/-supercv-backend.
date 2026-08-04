# 从零重建 SuperCV：后端练习指南

## 1. 为什么重新搭建

重新搭建一个简化版 SuperCV，比逐行抄写原项目更适合检验自己是否真正理解了后端开发。

推荐的学习闭环：

```text
理解需求
→ 独立设计
→ 编写测试
→ 自己实现
→ 运行和调试
→ 对比原项目
→ 总结差异
```

建议新建独立仓库 `supercv-practice`，不要直接在原项目上重写。这样既能随时对照，又能保留自己的设计过程和 Git 提交记录。

第一版的目标不是复刻整个 SuperCV，而是完成：

```text
用户注册/登录
→ 发放试用会员
→ 简历 CRUD
→ 创建商品和订单
→ 模拟支付
→ 发放正式会员权益
```

## 2. 第一阶段：搭建多模块骨架

先创建最小结构：

```text
supercv-practice
├── common
├── event
├── user
├── vip
├── src
├── build.gradle
└── settings.gradle
```

`settings.gradle`：

```groovy
rootProject.name = 'supercv-practice'

include 'common'
include 'event'
include 'user'
include 'vip'
```

初始依赖方向：

```text
common
  ↑
event
  ↑
user
  ↑
vip
```

根项目负责：

- 提供 Spring Boot 启动类。
- 聚合所有业务模块。
- 统一 Java、Spring Boot、测试和依赖版本。
- 放置 Filter、Interceptor、ControllerAdvice 等应用级能力。

子模块只生成普通 JAR，不需要独立的 Spring Boot 启动类：

```groovy
bootJar {
    enabled = false
}

jar {
    enabled = true
}
```

验收：

- `./gradlew projects` 能显示所有子模块。
- `./gradlew bootRun` 能启动根应用。
- 能解释 `settings.gradle`、根 `build.gradle` 和子模块 `build.gradle` 的职责。

## 3. 第二阶段：实现用户模块

先设计最小用户表：

```sql
CREATE TABLE cv_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    telephone VARCHAR(20) NOT NULL UNIQUE,
    nick_name VARCHAR(32) NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);
```

按下面的调用链实现：

```text
UserController
→ UserService
→ UserRepository
→ UserMapper
→ cv_user
```

第一批接口：

```http
POST  /v1/users
GET   /v1/users/{id}
PATCH /v1/users/{id}/nickname
```

重点练习：

- Spring MVC 请求参数绑定。
- Controller、Service、Repository、Mapper 分层。
- MyBatis 注解 SQL 和结果映射。
- 数据库唯一约束。
- 统一响应和业务异常。
- 成功与失败场景的集成测试。

验收：

- 手机号重复时有清晰的业务错误。
- Controller 不直接访问 Mapper。
- Mapper SQL 使用 `#{}` 参数绑定，不拼接用户输入。
- 查询、创建、修改接口都有测试。

## 4. 第三阶段：实现安全的随机 Token

使用数据库持久化的 Opaque Token，不必急着引入 JWT。

建议表结构：

```sql
CREATE TABLE auth_token (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_hash CHAR(64) NOT NULL UNIQUE,
    uid BIGINT NOT NULL,
    expire_time DATETIME NOT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_auth_token_uid(uid)
);
```

认证流程：

```text
SecureRandom 生成32字节随机数据
→ Base64URL 编码为原始 Token
→ 计算 SHA-256(Token)
→ 数据库只保存 Token 哈希
→ 原始 Token 只返回给客户端
→ 后续请求对 Token 求哈希后查询数据库
```

第一批接口：

```http
POST   /v1/login/dev
GET    /v1/user/info
DELETE /v1/auth/token
```

必须处理：

- Token 不存在。
- Token 已过期。
- Token 与用户不匹配。
- 临近过期 Token 续期。
- 主动退出后立即失效。
- 日志不输出 Token、密码或验证码。

建议使用 `AuthTokenInterceptor` 统一认证，并将认证结果转换成服务端可信的当前用户信息，避免 Controller 直接相信客户端提交的 `uid`。

验收：

- 使用 `SecureRandom`，不使用 `Random + MD5`。
- 已过期 Token 必须拒绝，不能被自动复活。
- 数据库泄漏后不能直接使用其中的 Token 登录。
- 日志中看不到完整 Token。

## 5. 第四阶段：事件与试用会员

在 `event` 模块定义：

```java
public record UserRegisteredEvent(long uid) {
}
```

用户首次创建成功后发布事件：

```text
UserService 创建用户
→ 发布 UserRegisteredEvent
→ TrialVipGrantListener 接收
→ VipService 发放试用会员
```

需要思考：

- 事件同步执行还是事务提交后执行？
- 会员发放失败是否导致注册回滚？
- 事件重复执行时如何避免重复发放？
- 用户已存在时是否应该再次发布注册事件？

建议先实现同步事件，再尝试 `@TransactionalEventListener`，比较两者的事务行为。

验收：

- 新用户获得一次试用会员。
- 老用户再次登录不会重复获得权益。
- 重复处理事件不会产生多条会员记录。

## 6. 第五阶段：简历模块

新增 `resume` 模块：

```groovy
dependencies {
    implementation project(':common')
    implementation project(':user')
}
```

先只实现：

```http
POST   /v1/resumes
GET    /v1/resumes/{id}
GET    /v1/resumes/mine
PATCH  /v1/resumes/{id}
DELETE /v1/resumes/{id}
```

重点规则：

- 登录用户才能创建简历。
- 用户只能修改和删除自己的简历。
- 简历列表必须有稳定排序。
- 删除优先采用逻辑删除。
- 分页响应包含总数、页码、每页数量和数据列表。

调用链：

```text
认证拦截器
→ 简历归属校验
→ ResumeController
→ ResumeService
→ ResumeRepository
→ ResumeMapper
→ resume 表
```

验收：

- 普通用户无法修改其他用户的简历。
- 删除后列表不可见，但数据库记录仍保留。
- 空结果、非法分页和越权访问都有测试。

## 7. 第六阶段：商品、订单与模拟支付

增加：

```text
product
order
```

模块依赖：

```text
user + product + vip
          ↓
        order
```

业务闭环：

```text
查询商品
→ 创建待支付订单
→ 选择 MockPayment
→ 模拟支付成功
→ 处理支付回调
→ 发放会员权益
```

第一版不要接微信支付，先把事务、状态和幂等做好。

重点练习：

- 订单金额使用下单时的商品快照。
- 订单状态转换必须有明确前置状态。
- 相同支付回调重复到达不能重复发放权益。
- 两个线程同时处理回调时只能有一个成功更新状态。
- 发放权益失败时，订单状态和权益数据应保持一致。

推荐使用条件更新：

```sql
UPDATE cv_order
SET payment_status = 'PAID'
WHERE id = #{id}
  AND payment_status = 'PENDING';
```

根据受影响行数判断当前线程是否真正完成了状态转换。

验收：

- 重复回调不会重复发放会员。
- 并发回调测试通过。
- 任一步骤失败时事务能够回滚。
- 能画出完整订单状态机。

## 8. 第七阶段：LLM 与 OSS

核心业务稳定后再添加第三方能力。先定义接口，再提供 Mock 实现：

```java
public interface LLM {
    LLMResult invoke(LLMPrompt prompt);
}
```

```java
public interface ObjectStorage {
    UploadCredential createCredential(long uid);
}
```

实现顺序：

```text
MockLLM / MockObjectStorage
→ 业务流程和测试
→ QianWenLLM / AliyunObjectStorage
→ 超时、错误转换和调用日志
```

这样在没有第三方账号或密钥时，项目仍然可以完整运行和测试。

验收：

- 测试不调用真实第三方服务。
- AppSecret 等密钥不进入前端和 Git。
- 外部异常被转换成项目内部异常。
- 网络调用设置超时，并区分可重试和不可重试错误。

## 9. 每个功能的固定开发流程

每个功能都按以下步骤完成：

1. 写清楚业务需求和失败场景。
2. 定义请求、响应和错误码。
3. 设计表结构、约束和索引。
4. 先写至少一个成功测试和一个失败测试。
5. 实现 Controller、Service、Repository、Mapper。
6. 使用 Swagger 或 `curl` 联调。
7. 查看执行前后的数据库数据。
8. 检查日志是否泄漏敏感信息。
9. 运行相关测试和完整测试。
10. 最后再查看原项目如何实现。

每个功能建议单独提交：

```text
feat: add user registration
feat: add opaque token authentication
feat: grant trial vip on registration
feat: add resume crud
feat: add mock payment
test: verify payment callback idempotency
```

## 10. 可以主动改进原项目的地方

重建时不要机械复制，可以有意识地改进：

- 使用构造器注入代替字段 `@Autowired`。
- 使用 DTO 隔离 HTTP 参数和 Domain。
- Token 使用 `SecureRandom`，数据库只保存哈希。
- 严格检查 Token 过期时间，日志进行敏感信息脱敏。
- 使用 Flyway 或 Liquibase 管理数据库迁移。
- 简单 CRUD 可使用 MyBatis-Plus，复杂 SQL 使用 MyBatis XML。
- 跨模块只暴露必要的服务接口。
- 权益次数使用条件更新实现原子扣减。
- 支付回调使用状态条件、唯一约束和事务保证幂等。
- 所有第三方能力先提供 Mock/Fake 实现。

## 11. 推荐实施顺序

```text
项目骨架
→ 用户 CRUD
→ 统一异常
→ Token 登录
→ 认证拦截器
→ 注册事件
→ 试用会员
→ 简历 CRUD
→ 简历权限
→ 商品
→ 订单
→ 模拟支付
→ 会员发放
→ LLM Mock
→ OSS Mock
→ 前端联调
```

## 12. 最终验收

完成第一版后，确保自己能够回答：

- Gradle 如何识别子模块并计算模块依赖？
- 一次请求经过哪些 Filter、Interceptor 和业务层？
- MyBatis 如何创建 Mapper 代理并执行 SQL？
- Token 如何生成、存储、过期和撤销？
- 用户注册事件为什么不会重复发放会员？
- 用户为什么不能修改其他人的简历？
- 订单为什么不会因重复支付回调而重复发放权益？
- 事务边界为什么这样设计？
- 复杂 SQL 为什么选择 XML，而不是强行使用 Wrapper？
- 没有真实第三方服务时，测试为什么仍然能够运行？

当这些问题都能结合代码、SQL 和测试解释清楚时，就说明已经真正掌握了这个项目的主要架构，而不只是照着源码完成了一次复制。
