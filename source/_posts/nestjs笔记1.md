---
title: NestJS笔记1
date: 2023-05-27 16:25:19
tags:
- NestJS
categories: NestJS
---


<!-- more -->

## nest cli

```sh
# 安装cli
npm install -g @nestjs/cli
# 更新cli
npm update -g @nestjs/cli
# 创建项目
nest new 项目名
# 查看cli项目
nest -h
# 生成一个完整的模块
nest generate resource xxx
# 只生成module、controller... 可以nest new -h查看能生成什么
nest generate module/controller/... xxx
# 启动 --watch 监听js和ts变化、--watchAssets 监听所有资源文件、--config 选择nest cli配置文件
nest start
```

设置允许访问静态资源：

```js
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/static'});
  await app.listen(3000);
}
bootstrap();
```

## 5种传输数据的方式

### URL param

```ts
@Controller('api/person')
export class PersonController {
  @Get(':id')
  urlParm(@Param('id') id: string) {
    return `received: id=${id}`;
  }
}
```

### URL query

```ts
@Controller('api/person')
export class PersonController {
  @Get('find')
  query(@Query('name') name: string, @Query('age') age: number) {
    return `received: name=${name},age=${age}`;
  }
}
```

### form urlencoded

form urlencoded 是通过 body 传输数据，其实是把 query 字符串放在了 body 里，所以需要做 url encode：

```ts
import { CreatePersonDto } from './dto/create-person.dto';

class CreatePersonDto {
    name: string;
    age: number;
}

@Controller('api/person')
export class PersonController {
  @Post()
  body(@Body() createPersonDto: CreatePersonDto) {
    return `received: ${JSON.stringify(createPersonDto)}`
  }
}
```

### json

代码和上面一样，也是通过Body装饰器接收。nest根据Content-Type进行区分，使用不同的方式进行解析

### form data

form data报文有点不一样

{% asset_img formData.webp %}

Nest 解析 form data 使用 FilesInterceptor 的拦截器，用 @UseInterceptors 装饰器启用，然后通过 @UploadedFiles 来取。非文件的内容，同样是通过 @Body 来取。

首先安装一个ts依赖

```sh
npm i -D @types/multer
pnpm add -D @types/multer
```

```ts
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreatePersonDto } from './dto/create-person.dto';

@Controller('api/person')
export class PersonController {
  @Post('file')
  @UseInterceptors(AnyFilesInterceptor())
  body2(@Body() createPersonDto: CreatePersonDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
    return `received: ${JSON.stringify(createPersonDto)}`
  }
}
```

## Provide注入方式

先创建个测试的service：

```ts testService.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  getHello() {
    return 'HelloWorld!';
  }
}
```

在module定义一下：

```ts aaa.Module.ts
// import...
@Module({
  controllers: [AaaController],
  providers: [AaaService, TestService],
})
export class AaaModule {}
```

这个provider是简写方式，完整写法是这样：

```ts
@Module({
  controllers: [AaaController],
  providers: [AaaService, {
    provide: TestService,
    useClass: TestService,
  }],
})
export class AaaModule {}
```

也可以自定义一下provide的名字：

```ts
@Module({
  controllers: [AaaController],
  providers: [AaaService, {
    provide: 'test_service',
    useClass: TestService,
  }],
})
export class AaaModule {}
```

这样inject就需要写上inject名字：

```ts
@Controller('aaa')
export class AaaController {
  constructor(private readonly aaaService: AaaService, @Inject('test_service') private readonly testService: TestService) {}
}
```

除了构造器注入，也可以属性注入：

```ts
@Controller('aaa')
export class AaaController {
  // 如果providers不自动provide，只需要@Inject(TestService) 
  @Inject('test_service') 
  private readonly testService: TestService;

  constructor(private readonly aaaService: AaaService) {}
}
```

### 注入别的东西？

除了class，也可以注入一些值：

```ts
@Module({
  controllers: [AaaController],
  providers: [
    {
      provide: 'str',
      useValue: 'this is string',
    },
    {
      provide: 'obj',
      useValue: {
        name: 'lin',
        age: 24,
      },
    },
    {
      provide: 'factory',
      useFactory() {
        return {
          name: 'lin',
          age: 24,
        };
      },
    },
    {
      provide: 'paramFactory',
      useFactory(f: { age: number }, str: string) {
        return {
          name: str,
          age: f.age,
        };
      },
      inject: ['factory', 'str'],
    },
    {
      provide: 'asyncFactory',
      async useFactory() {
        await new Promise((res) => {
          setTimeout(res, 3000);
        });
        return {
          name: 'lin',
          age: 24,
        };
      },
    },
    {
      provide: 'alias',
      useExisting: 'str',
    },
  ],
})
export class AaaModule {}
```

注入：

```ts
@Controller('aaa')
export class AaaController {
  @Inject(TestService)
  private readonly testService: TestService;
  @Inject('str')
  private readonly str: string;
  @Inject('obj')
  private readonly obj: { age: number, name: string };
  @Inject('factory')
  private readonly factory: { age: number, name: string };
  @Inject('paramFactory')
  private readonly paramFactory: { age: number, name: string };
  @Inject('asyncFactory')
  private readonly asyncFactory: { age: number, name: string };
  @Inject('alias')
  private readonly alias: string;
}
```

如果是用class作为provide，可以不需要显式声明注入类型，但是如果用属性注入需要加上@Inject否则不会注入：

```ts
@Controller('aaa')
export class AaaController {
  @Inject()
  private readonly testService: TestService;
}
```

## 模块导入和全局模块

如果aaaModule需要使用bbbModule里导出的一些内容，可以这样写：

```ts bbb.module.ts
@Module({
  controllers: [BbbController],
  providers: [BbbProvider],
  exports: [BbbProvider],
})
export class BbbModule {}
```

```ts aaa.module.ts
@Module({
  imports: [BbbModule]
  controllers: [AaaController],
  providers: [AaaProvider],
})
export class AaaModule {}
```

这样就可以在 aaa的controller或者service 内注入 BbbService 了

如果不想要每个都导入，可以声明Bbb成为全局模块：

```ts bbb.module.ts
@Global()
@Module({
  controllers: [BbbController],
  providers: [BbbProvider],
  exports: [BbbProvider],
})
export class BbbModule {}
```

aaaModule和其他的module就不需要写imports，也能注入bbbService了，不过能不用就不用全局注入

## 生命周期

官方文档上对nestjs应用启动和退出的生命周期说明：

{% asset_img lifecycleEvents.png %}

nest提供了几个接口：OnModuleInit,OnModuleDestroy,OnApplicationBootstrap,BeforeApplicationShutdown,OnApplicationShutdown

可以在controller或者service里面实现这些接口

```ts
@Controller()
export class AppController
  implements
    OnModuleInit,
    OnModuleDestroy,
    OnApplicationBootstrap,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  onApplicationBootstrap(): any {}

  onModuleDestroy(): any {}

  onModuleInit(): any {}

  onApplicationShutdown(signal?: string): any {
  }

  beforeApplicationShutdown(signal?: string): any {
  }
}
```

onApplicationShutdown和beforeApplicationShutdown能接收到系统传过来的signal系统信号。

所有的生命周期函数都支持 async。

## 各种装饰器

### Middleware 中间件

文档还没细说，后面再补

### Guard 守卫

路由守卫作用是在进入某个controller前判断使用有权限访问：

```ts
@Injectable()
export class TestGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return validAuth(context.switchToHttp().getRequest().headers);
  }
}
```

比如可以检查headers里面是否带了token，token是否有效。

接着让一个controller使用这个guard：

```ts
@Controller('aaa')
@UseGuards(TestGuard)
export class AaaController {}
```

也可以全局使用：

```ts
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new TestGuard());
await app.listen(3000);
```

注意要new。

### Interceptor 拦截器



## Nest 自带的装饰器

- @Module： 声明 Nest 模块
- @Controller：声明模块里的 controller（可以传字符串，也可以传对象比如：`{ host: ':host.0.0.1', path: 'aaa' }`，通过`@HostParam('host')`取到 host）
- @Injectable：声明模块里可以注入的 provider（这个 provider 不只是 service，也可以是 Guard、Interceptor 等等）
- @Inject：通过 token 手动指定注入的 provider，tonken 可以是 class 或者 string
- @Optional：声明注入的 provider 是可选的，可以为空
- @Catch：声明 exception filter 处理的 exception 类型
- @UseFilters：路由级别使用 exception filter
- @UsePipes：路由级别使用 pipe
- @UseInterceptors：路由级别使用 interceptor
- @SetMetadata：在 class 或者 handler 上添加 metadata
- @Get、@Post、@Put、@Delete、@Patch、@Options、@Head：声明 get、post、put、- delete、patch、options、head 的请求方式
- @Param：取出 url 中的参数，比如 /aaa/:id 中的 id
- @Query: 取出 query 部分的参数，比如 /aaa?name=xx 中的 name
- @Body：取出请求 body，通过 dto class 来接收
- @Headers：取出某个或全部请求头
- @Session：取出 session 对象，需要启用 express-session 中间件
- @HostParm： 取出 host 里的参数
- @Req、@Request：注入 request 对象
- @Res、@Response：注入 response 对象，一旦注入了这个 Nest 就不会把返回值作为响应了，除非指定 passthrough 为 true
- @Next：注入调用下一个 handler 的 next 方法
- @HttpCode： 修改响应的状态码
- @Header：修改响应头
- @Redirect：指定重定向的 url
- @Render：指定渲染用的模版引擎

## 自定义装饰器

直接用 cli 生成模板：

```sh
nest g decorator aaa
```

生成结果

```ts
import { SetMetadata } from '@nestjs/common';

export const Aaa = (...args: string[]) => SetMetadata('aaa', args);
```

使用:

```ts
class AaaGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log(this.reflector.get('aaa', context.getClass()));
    return true;
  }
}

@Controller('aaa')
@UseGuards(AaaGuard)
@Aaa('321')
export class AaaController {
// ......
}
```

当然给handler用也行：

```ts
class AaaGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log(this.reflector.get('aaa', context.getHandler()));
    return true;
  }
}

@Controller('aaa')
@UseGuards(AaaGuard)
export class AaaController {
    @Get()
    @Aaa('321')
    test() {
        return ''
    }
}
```