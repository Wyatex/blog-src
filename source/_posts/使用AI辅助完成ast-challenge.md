---
title: 使用AI辅助完成ast-challenge
date: 2024-06-24 09:48:25
tags:
- Babel
- AI
- AST
- JavaScript
categories: JavaScript
---

> 今天晚上在技术交流群看到有小伙伴求助，说是有一个编程题，一看是ast相关的题目。我想之前学了ast都没怎么玩过，这不来个课后作业了吗？然后打开我的ide kuku写了一遍。毕竟是萌新嘛，就借助了AI帮忙写写。

这里依然请出我们的AI编程小助手：**DeepSeek-Coder-V2**

题目是，给一个对象，生成对应的TS代码：


```json
{
    "Pools": {
        "requestType": "QueryPoolsRequest",
        "responseType": "QueryPoolsResponse"
    }
  }
```

生成：


```ts
export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> {
    request?: QueryPoolsRequest;
}
const usePools = <TData = QueryPoolsResponse,>({
    request,
    options
}: UsePoolsQuery<TData>) => {
    return useQuery<QueryPoolsResponse, Error, TData>(["poolsQuery", request], () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.pools(request);
    }, options);
};
```

<!-- more -->

## 第一种方法：构建ast树生成

我一开始看到test的`pure.test.ts`文件，看到示例是一个ast构建的方法，然后我就尝试用这种方法。首先我们可以看到`interface`和方法定义分开，所以我们分开两步，分别构建`interface`和函数定义

---

**我**：`export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> { request?: QueryPoolsRequest; }` 这段代码怎么用@babel/types生成

---

**DeepSeek-Coder-V2**：

要使用 `@babel/types` 生成类似于 `export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> { request?: QueryPoolsRequest; }` 的代码，你需要创建相应的 AST 节点并组合它们。以下是一个示例代码，展示了如何使用 `@babel/types` 生成这段代码：

```javascript
const t = require('@babel/types');
const generator = require('@babel/generator').default;

// 创建泛型参数 TData
const tDataTypeParameter = t.identifier('TData');

// 创建接口名称 UsePoolsQuery
const interfaceName = t.identifier('UsePoolsQuery');

// 创建泛型类型参数列表
const typeParameters = t.typeParameterDeclaration([tDataTypeParameter]);

// 创建 ReactQueryParams 泛型类型
const reactQueryParamsType = t.genericTypeAnnotation(
  t.identifier('ReactQueryParams'),
  t.typeParameterInstantiation([
    t.identifier('QueryPoolsResponse'),
    t.identifier('TData')
  ])
);

// 创建 extends 子句
const extendsClause = t.tsExtendsClause([
  t.tsExpressionWithTypeArguments(reactQueryParamsType)
]);

// 创建 request 属性
const requestProperty = t.objectTypeProperty(
  t.identifier('request'),
  t.tsTypeAnnotation(
    t.tsUnionType([
      t.identifier('QueryPoolsRequest'),
      t.nullLiteralTypeAnnotation()
    ])
  )
);

// 创建接口主体
const interfaceBody = t.objectTypeAnnotation([requestProperty]);

// 创建接口声明
const interfaceDeclaration = t.tsInterfaceDeclaration(
  interfaceName,
  typeParameters,
  extendsClause,
  interfaceBody
);

// 创建 export 声明
const exportDeclaration = t.exportNamedDeclaration(interfaceDeclaration, []);

// 生成代码
const { code } = generator(exportDeclaration);

console.log(code);
```

运行这段代码后，`console.log(code)` 将输出类似于以下内容的代码：

```ts
export interface UsePoolsQuery<TData> extends ReactQueryParams<QueryPoolsResponse, TData> {
  request?: QueryPoolsRequest | null;
}
```

请注意，生成的代码可能会有一些细微的差异，具体取决于你使用的 `@babel/types` 版本和配置。你可以根据需要调整生成的代码。

---

粘贴到ide，发现类型有些地方类型不对，我就根据`@babel/types`方法提供的类型提示进行修改。我发现babel里面的很多方法都是`xxxXxxXxx`方法对应生成`XxxXxxXxx`节点，所以你需要的方法入参不对，可以根据这个规则来猜出来。

其中第一次提问肯定会有些部分不正确，比如extends部分，interface的属性可选部分不正确，我们可以这样向ai提问：

- `extendsClause`这里需要用 `tsExpressionWithTypeArguments(expression: t.TSEntityName, typeParameters?: t.TSTypeParameterInstantiation | null | undefined): t.TSExpressionWithTypeArguments` 这个方法来生成
- body部分需要使用`tsInterfaceBody(body: t.TSTypeElement[]): t.TSInterfaceBody`这个方法

然后ai就修改了部分代码，然后我们再修正我们的代码，最终完成interface部分代码：


```ts
import * as t from "@babel/types";

export function genInterface(
  requestType: string,
  responseType: string,
  interaceName: string
) {
  // 这里AI生成的需要修改，我们需要ts的泛型入参，所以改用t.typeParameterDeclaration
  const typeParameters = t.tsTypeParameterDeclaration([
    // 这里也是猜一下，constraint不知道是啥，给个空，
    // 第二个参数_default，看起来是给默认值。我们这里不需要，给空
    // 第三个参数name，猜是泛型名字，按照题目要求给TData
    t.tsTypeParameter(null, null, "TData"),
  ]);

  // extends部分ai也错了，我们看下面的t.tsInterfaceDeclaration
  // extends需要传TsExpressionWithTypeArguments[]
  // 那我们大胆猜用t.tsExpressionWithTypeArguments创建
  // 第一个参数expression: t.TSEntityName应该是需要extends的名字
  // 仿照AI传个t.identifier("ReactQueryParams")
  // 第二个参数是typeParameters?: t.TSTypeParameterInstantiation
  // 看的出来是类型入参
  const _extends = [
    t.tsExpressionWithTypeArguments(
      t.identifier("ReactQueryParams"),
      t.tsTypeParameterInstantiation([
        // 所以我们反照AI入参两个引入类型
        t.tsTypeReference(t.identifier(responseType)),
        t.tsTypeReference(t.identifier("TData")),
      ])
    ),
  ];

  // 这部分AI也不太正确，向AI提出提问后提示我们这样改
  const requestProp = t.tsPropertySignature(
    t.identifier("request"),
    t.tsTypeAnnotation(t.tsTypeReference(t.identifier(requestType)))
  );

  // 也是向AI提出问题，上面说的答案不对，然后AI告诉我这样改
  requestProp.optional = true;

  const interfaceBody = t.tsInterfaceBody([requestProp]);

  return t.tsInterfaceDeclaration(
    t.identifier(interaceName),
    typeParameters,
    _extends,
    interfaceBody
  );
}
```

然后我继续向AI提问：使用@babel/types生成： `const usePools = <TData = QueryPoolsResponse,>({ request, options }: UsePoolsQuery<TData>) => { return useQuery<QueryPoolsResponse, Error, TData>(["poolsQuery", request], () => { if (!queryService) throw new Error("Query Service not initialized"); return queryService.pools(request); }, options); };` 这个方法

AI回答就不展示了，我们按照向ai提问或者自己猜的方法完成方法部分的构建：


```ts
import * as t from "@babel/types";

export function genFunction(
  responseType: string,
  paramTypeName: string,
  functionName: string,
  keyName = "poolsQuery",
  queryServiceMethodName = "pools"
) {
  // 创建函数参数
  const requestParam = t.objectPattern([
    t.objectProperty(
      t.identifier("request"),
      t.identifier("request"),
      false,
      true
    ),
    t.objectProperty(
      t.identifier("options"),
      t.identifier("options"),
      false,
      true
    ),
  ]);

  //入参ts注解
  requestParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier(paramTypeName),
      t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier("TData"))])
    )
  );

  // 函数体
  const functionBody = t.blockStatement([
    t.returnStatement(
      t.callExpression(t.identifier("useQuery"), [
        t.arrayExpression([t.stringLiteral(keyName), t.identifier("request")]),
        t.arrowFunctionExpression(
          [],
          t.blockStatement([
            t.ifStatement(
              t.unaryExpression("!", t.identifier("queryService")),
              t.blockStatement([
                t.throwStatement(
                  t.newExpression(t.identifier("Error"), [
                    t.stringLiteral("Query Service not initialized"),
                  ])
                ),
              ])
            ),
            t.returnStatement(
              t.callExpression(
                t.memberExpression(
                  t.identifier("queryService"),
                  t.identifier(queryServiceMethodName)
                ),
                [t.identifier("request")]
              )
            ),
          ])
        ),
      ])
    ),
  ]);
  
  // 函数表达式，这里AI提示用的是普通方法，
  // 我们需要改成箭头函数，使用t.arrowFunctionExpression
  const functionExpression = t.arrowFunctionExpression(
    [requestParam],
    functionBody,
    true
  );

  // 声明泛型类型参数 TData
  functionExpression.typeParameters = t.tsTypeParameterDeclaration([
    t.tsTypeParameter(
      null,
      t.tsTypeReference(t.identifier(responseType)),
      "TData"
    ),
  ]);

  const constDec = t.variableDeclaration("const", [
    t.variableDeclarator(t.identifier(functionName), functionExpression),
  ]);
  return constDec;
}
```

这样就可以按需入参生成ast啦，可以使用`generator`生成我们想要的方法

## 第二种方法：使用模板代码，然后修改名称

这种方法更加方便，我们写好一段模板的代码：

```ts
const code = `
export interface INTERFACE_NAME<TData> extends ReactQueryParams<RESPONSE_TYPE, TData> {
    request?: REQUEST_TYPE;
}
const FUNCTION_NAME = <TData = RESPONSE_TYPE,>({
    request,
    options
}: INTERFACE_NAME<TData>) => {
    return useQuery<RESPONSE_TYPE, Error, TData>(["KEY_NAME", request], () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.QUERY_SERVICE_METHOD_NAME(request);
    }, options);
};
`;
```

然后使用`babelTraverse`方法对名字进行转换

```ts
export function transformCode(
  requestType: string,
  responseType: string,
  paramTypeName: string,
  functionName: string,
  keyName = "poolsQuery",
  queryServiceMethodName = "pools"
) {
  const plugins: ParserPlugin[] = ["typescript"];

  const ast = parse(code, {
    sourceType: "module",
    plugins,
  });

  babelTraverse(ast as any, {
    // 只有一个地方用到TSInterfaceDeclaration
    // 宝贝不用怕，我们直接改就好
    TSInterfaceDeclaration(path) {
      path.node.id.name = paramTypeName;
    },
    Identifier(path) {
      // 将我们模板中的这些标识符直接改成我们想要的
      if (path.node.name === "REQUEST_TYPE") {
        path.node.name = requestType;
      } else if (path.node.name === "RESPONSE_TYPE") {
        path.node.name = responseType;
      } else if (path.node.name === "FUNCTION_NAME") {
        path.node.name = functionName;
      } else if (path.node.name === "QUERY_SERVICE_METHOD_NAME") {
        path.node.name = queryServiceMethodName;
      }
    },
    StringLiteral(path) {
      // 根据我们前面写的代码，有两个地方用了StringLiteral
      // t.stringLiteral("Query Service not initialized")
      // 所以这里宝贝记得判断一下
      if (path.node.value === "KEY_NAME") {
        path.node.value = keyName;
      }
    },
  });

  return ast;
}
```

## 完结

很好我们继续完成jest部分代码，调用我们写好的两个方法。

这是我的作业答案，宝贝可以拿去学习改进一下。

https://github.com/Wyatex/ast-challenge