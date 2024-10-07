---
title: 优化 Taro 项目数据处理：使用 Vuex 进行全局状态管理
tags:
  - Taro
  - Vue
categories:
  - Taro
abbrlink: 19357
date: 2023-04-20 08:36:16
---

## 前言

在应用程序中，我们通常采用 `action` => `state` => `view` 的模式，来更新数据和视图。由于“单向数据流”的简洁性，使得开发者能够轻松追踪到各个数据的流向和状态变化。然而，在一些复杂的应用程序中，比如具有多个视图和嵌套组件的应用场景，这种模式的简洁性很容易被破坏。这时，我们需要一个全局状态管理模式来管理应用程序中的状态，以保证状态的一致性和可追踪性，同时降低组件间的耦合度。

以下是单向数据流图：

![单向数据流图](https://v3.vuex.vuejs.org/flow.png)

（图片来源于 vuex 官网）

Vuex 是一个专为 Vue 复杂应用程序开发的状态管理工具。它采用集中式存储，来管理应用的所有组件的状态，并以相应的规则保证状态以一种可追踪的方式管理。当多个组件需要共享相同的状态时，使用 Vuex 可以让这些组件共享同一个状态树，避免了传递状态数据的复杂性，从而使得状态管理更加简单和可维护。同时，Vuex 也适用于 Taro 跨端项目，可以帮助开发者更好地管理跨端项目中的状态，提高开发效率和代码可维护性。

下图是 Vuex 的实现原理图：

![vuex 原理图](https://v3.vuex.vuejs.org/vuex.png)

（图片来源于 vuex 官网）

## 快速开始

> 基于 Taro v3.5.6， Vue2， vuex v3.0.0。

### 安装

首先请安装 `vuex` 的 3.x 版本：

```bash
$ yarn add vuex@^3
# 或者使用 npm
$ npm install vuex@^3
```

### 使用

在项目中新建 `src/store/index.js` 文件用来配置 `store`，根据需求设置 `state`、`mutations`、`actions`、`getters`：

```javascript
// src/store/index.js

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex); // 在 Vue 上注册 Vuex 模块内容

// state、mutations、actions、getters 模块也可以单独管理和维护
const state = {
  count: 0,
};

const mutations = {
  addCount(state) {
    state.count++;
  },
};

const actions = {
  addCount(context) {
    context.commit("addCount");
  },
};

const getters = {
  getCount(state) {
    return state.count;
  },
};

// Vuex 3.x 版本要用 new 实例的方式导出
export default new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});
```

为了在组件中可以通过 `this.$store` 全局获取到 store 中的内容，我们需要把 store 注入到 Vue 实例中：

```javascript
// src/app.js

import Vue from "vue";
import store from "./store";

const App = {
  store,
  render(h) {
    return h("block", this.$slots.default);
  },
};

export default App;
```

接下来，即可以在 Vue 组件中使用 store 了，如：

```vue
<template>
  <view class="index">
    <button @tap="handleTap">数字增加</button>
    <view>{{ getCount }}</view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex"; // mapGetters, mapActions 是 vuex 提供的辅助函数
export default {
  computed: {
    ...mapGetters(["getCount"]), // 把 `this.getCount` 映射为 `this.$store.getters.getCount`
  },
  methods: {
    ...mapActions(["addCount"]), // 将 `this.addCount()` 映射为 `this.$store.dispatch('addCount')`
    handleTap() {
      this.addCount(); // 触发 action
    },
  },
};
</script>
```

## 数据模块化管理

> 由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

从上文【快速开发】模块可知，所有应用程序的数据和状态都是统一维护在 `src/store/index.js` 文件中，所以当应用程序变得复杂时，将会变得难以维护。

为此，`vuex` 提供了一种通过命名空间来进行模块化的管理方案，被分割的每个模块都拥有自己的 `state`、`mutation`、`action`、`getter`、甚至是嵌套子模块。下面是具体的代码示例：

```javascript
// src/store/index.js

// 模块可以单独维护在不同文件中
import moduleGlobal from "./global"

const moduleCount = {
  namespaced: true, // 注意：模块化管理数据，请不要忘了命名空间的开启；如果不开启，则表示在全局对象中
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const store = new Vuex.Store({
  modules: {
    global: moduleGlobal, // 模块global
    count: moduleCount // 模块count
  }
})
```

在 Vue 组件中使用模块化 store ，需要添加模块的命名空间参数，如：

```vue
<template>
  <view class="index">
    <button @tap="handleTap">数字增加</button>
    <view>{{ getCount }}</view>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex"; // mapGetters, mapActions 是 vuex 提供的辅助函数
export default {
  computed: {
    ...mapGetters("count", ["getCount"]), // 第一个参数为命名空间，把 `this.getCount` 映射为 `this.$store.getters['count/getCount']`
  },
  methods: {
    ...mapActions("count", ["addCount"]), // 第一个参数为命名空间，将 `this.addCount()` 映射为 `this.$store.dispatch('count/addCount')`
    handleTap() {
      this.addCount(); // 触发 action
    },
  },
};
</script>
```

## 案例场景

在实际应用开发中，存在着许多复杂的应用场景需要使用 vuex 进行数据状态管理，如登录、表单校验、偏好设置、路由管理等常见场景。

下面将从实际场景出发，逐步介绍如何使用 vuex 进行数据状态管理。

### 1、用户登录信息全局共享和管理

> 应用程序需要处理用户登录和授权，涉及到用户的身份认证、用户信息和权限等相关信息的管理。在这种情况下，使用 Vuex 可以将这些信息存储在全局状态树中，并在多个组件之间共享这些信息。

在实际项目中，通常会对登录和退出登录模块进行统一的封装和处理，保持用户信息能全局共享。例如在登录页 `pages/login/index` 中，进行用户登录，并将用户信息更新到全局数据中。而在个人信息页 `pages/user/index` 中进行退出登录，并将用户信息从全局数据中清除。

下图展示了登录和退出登录的简易流程：

![登录和退出登录的简易流程](https://img.dongbizhen.com/blog/202304110901.png)

以下是具体实现代码：

1、采用 vuex 模块化，将用户信息数据在 store 中独立管理。

```javascript
// store/modules/user.js
// 默认值
const defaultUser = {
  name: "游客",
  age: "18",
  role: "visitor",
  isLogin: false,
};

const state = {
  user: defaultUser,
};

const mutations = {
  changeUser(state, payload) {
    state.user = payload;
  },
  clearUser(state) {
    state.user = defaultUser;
  },
};

const actions = {
  // 更新用户信息
  changeUser(context, payload) {
    context.commit("changeUser", payload);
  },
  // 清空用户信息
  clearUser(context) {
    context.commit("clearUser");
  },
};

const getters = {
  getUser(state) {
    return state.user;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
```

导出完整的 store 模块。

```javascript
// src/store/index.js

import Vue from "vue";
import Vuex from "vuex";
import moduleUser from "./modules/user";
Vue.use(Vuex); // 在 Vue 上注册 Vuex 模块内容

// Vuex 3.x 版本要用 new 实例的方式导出
export default new Vuex.Store({
  modules: {
    user: moduleUser,
  },
});
```

2、登录页模块 `pages/login/index`，负责调用登录接口，并更新用户信息。

```vue
<template>
  <view class="index">
    <view v-if="getUser.isLogin">
      <view>姓名：{{ getUser.name }}</view>
      <view>年龄：{{ getUser.age }}</view>
      <view>角色：{{ getUser.role }}</view>
    </view>
    <view v-else>
      <view>未登录</view>
    </view>
    <button @tap="handleLogin">点击登录</button>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex"; // mapGetters, mapActions 是 vuex 提供的辅助函数

/** 模拟登录接口 */
function login() {
  return Promise.resolve({ name: "张三", age: 30, role: "dev", isLogin: true });
}
export default {
  computed: {
    ...mapGetters("user", ["getUser"]),
  },
  methods: {
    ...mapActions("user", ["changeUser"]),
    handleLogin() {
      // 登录接口
      login().then((res) => {
        // 更新用户信息
        const { name, age, role, isLogin } = res;
        this.changeUser({ name, age, role, isLogin }); // 触发 vuex 的 action
      });
    },
  },
};
</script>
```

3、用户信息页 `pages/user/index`，负责调用退出登录接口，并清空当前用户信息。

```vue
<template>
  <view class="index">
    <view v-if="getUser.isLogin">
      <view>姓名：{{ getUser.name }}</view>
      <view>年龄：{{ getUser.age }}</view>
      <view>角色：{{ getUser.role }}</view>
    </view>
    <view v-else>
      <view>未登录</view>
    </view>
    <button @tap="handleLogout">退出登录</button>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex"; // mapGetters, mapActions 是 vuex 提供的辅助函数

/** 模拟退出登录接口 */
function logout() {
  return Promise.resolve();
}
export default {
  computed: {
    ...mapGetters("user", ["getUser"]),
  },
  methods: {
    ...mapActions("user", ["clearUser"]),
    handleLogout() {
      // 退出登录接口
      logout().then((res) => {
        // 清空用户信息
        this.clearUser(); // 触发 vuex 的 action
      });
    },
  },
};
</script>
```

### 2、表单数据多模块共享

> 应用程序需要处理复杂的表单数据和验证逻辑，例如表单的动态添加、删除、编辑等。在这种情况下，使用 Vuex 可以将表单数据存储在全局状态树中，并在多个组件之间共享表单数据和验证逻辑。

在移动端，通常会使用自定义的卡片样式来展示数据列表。当我们需要修改大量数据表单时，需要跳转到对应的表单详情页进行修改。修改完成后，我们会返回列表页，此时数据列表中对应的表单数据应该已经被更新。但是，在弱网情况下，接口数据返回较慢，导致回到列表页后数据变更缓慢或无法变更。

为了解决这种场景下的问题，我们可以使用 Vuex 实现数据的无感知更新，从而获得更流畅的用户体验。流程图如下：

![表单数据多模块共享流程图](https://img.dongbizhen.com/blog/202304112001.png)

下面是实现代码的参考：

1、采用 vuex 模块化，将列表信息数据在 store 中独立管理。

```javascript
// store/modules/list.js
const state = {
  moduleA: {
    a: [1, 2, 3, 4], // mock 列表数据
    b: [11, 22, 33, 44],
  },
  moduleB: {},
};

const mutations = {
  changeModuleA(state, payload) {
    state.moduleA[payload.name] = payload.value;
  },
  // ...
};

const actions = {
  changeModuleA(context, payload) {
    context.commit("changeModuleA", payload);
  },
};

const getters = {
  getModuleA(state) {
    return state.moduleA;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
```

2、列表页 `pages/list/index` ，根据 store 中模块数据遍历展示。

```vue
<template>
  <view class="index">
    <view v-for="(value, name) in getModuleA" :key="name">
      <view>模块:{{ name }}</view>
      <view v-for="item in value" :key="item">{{ item }}</view>
      <button @tap="() => handleDetail(name)">编辑</button>
    </view>
  </view>
</template>

<script>
import { mapGetters } from "vuex";
import Taro from "@tarojs/taro";
export default {
  onShow() {
    // 这里可以通过接口获取数据并做异步更新
    this.$forceUpdate(); // 因为 back 回退不会触发页面重新渲染，所以需要强制更新 vue 数据
  },
  computed: {
    ...mapGetters("list", ["getModuleA"]),
  },
  methods: {
    handleDetail(moduleName) {
      // 路由跳转到编辑详情页
      Taro.navigateTo({
        url: `/pages/list-detail/index?moduleName=${moduleName}`,
      });
    },
  },
};
</script>
```

3、列表详情页 `pages/list-detail/index`，详情页中进行表单数据修改，并在 store 中进行数据更新。更新成功后，Vuex 会响应式触发步骤 2 中的列表数据重新渲染。

```vue
<template>
  <view class="index">
    <view>模块:{{ moduleName }}</view>
    <input
      v-for="(item, index) in getModuleA[moduleName]"
      :key="item"
      @input="(e) => handleinput(e, index)"
      :value="item"
      placeholder="请输入"
    />
    <button @tap="handleSave">保存</button>
  </view>
</template>

<script>
import { mapGetters, mapActions } from "vuex"; // mapGetters, mapActions 是 vuex 提供的辅助函数
import Taro from "@tarojs/taro";
export default {
  onShow() {
    // 获取路由参数
    const params = Taro.getCurrentInstance().router.params;
    this.moduleName = params.moduleName;
  },
  data() {
    return { moduleName: "", dataList: [] };
  },
  computed: {
    ...mapGetters("list", ["getModuleA"]),
  },
  methods: {
    ...mapActions("list", ["changeModuleA"]),
    // 修改数据
    handleinput(e, index) {
      const value = e.detail.value;
      this.dataList[index] = value;
    },
    // 保存数据
    handleSave() {
      const storeData = this.getModuleA[this.moduleName]; // store 中数据
      const newData = Object.assign(storeData, this.dataList); // 合并后的新数据
      this.changeModuleA({ name: this.moduleName, value: newData }); // 触发 vuex 的 action
      // 这里可以做接口数据的分布提交
      // 保存后回到列表页
      Taro.navigateBack();
    },
  },
};
</script>
```

### 3、偏好设置（语言、主题）全局切换

> 应用程序需要管理用户偏好和设置，例如语言、主题和字体大小等。在这种情况下，使用 Vuex 可以将用户偏好和设置状态存储在全局状态树中，并在多个组件之间共享和更新这些状态。

在应用程序中，用户的偏好和设置通常会影响整个应用程序的外观和行为，因此需要集中管理和共享这些状态。使用 Vuex 可以将用户偏好和设置状态存储在全局状态树中，并在多个组件之间共享和更新这些状态，从而使代码更加模块化和易于维护。

具体而言，可以在 Vuex 中创建一个单独的 store 对象来存储用户偏好和设置状态。在该对象中，可以定义一些 mutation 和 action 方法来更新和操作用户偏好和设置状态。例如，可以定义一个 `SET_LANGUAGE` mutation 方法来更新应用程序的语言设置，或者定义一个 `SET_THEME` mutation 方法来更新应用程序的主题设置。当用户更改偏好或设置时，可以触发一个 mutation 方法来更新状态，并将新的状态存储在全局状态树中。同时，可以在需要访问用户偏好或设置的组件中使用 Vuex 提供的 mapState 方法来获取状态，从而更新视图。

通过将用户偏好和设置状态存储在全局状态树中，并在多个组件之间共享和更新这些状态，可以使代码更加模块化和易于维护。这样，不仅可以避免在多个组件之间传递属性或事件的复杂性，还可以将代码更好地组织在一起，使其更容易理解和修改。

### 4、路由状态管理

> 应用程序需要处理多级路由和视图的导航和状态管理。在这种情况下，使用 Vuex 可以将当前的路由状态存储在全局状态树中，并在多个组件之间共享和更新这些状态。

在这种场景下，Vuex 可以将当前的路由状态存储在全局状态树中。通过这种方式，可以在应用程序中的任何组件中访问路由状态，无需通过属性或事件传递路由状态。这样可以避免组件之间的耦合度，使得代码更加清晰和易于维护。

具体而言，Vuex 中可以使用一个单独的 store 对象来存储路由状态。在该对象中，可以定义一些 mutation 和 action 方法来更新和操作路由状态。当路由发生变化时，可以触发一个 mutation 方法来更新路由状态，并将新的状态存储在全局状态树中。同时，可以在需要访问路由状态的组件中使用 Vuex 提供的 mapState 方法来获取路由状态，从而更新视图。

## 最后

虽然 `vuex` 可以帮助我们有效地管理共享状态并简化大量应用场景的实现，但对于简单的应用程序而言，使用`vuex`反而会增加繁琐和冗余。因此，在考虑使用`vuex`之前，我们应该权衡短期和长期效益。

## 参考资料

- [vuex 官网](https://v3.vuex.vuejs.org/zh/)
- [Taro Vue2 vuex](https://taro-docs.jd.com/docs/vuex)
