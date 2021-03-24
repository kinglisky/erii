---
title: VUE 组件的一点思考
date: 2017-10-14 21:07:30
tags: 技能
---

我们往组件里面塞自定义内容，常见就是用 slot ：


这里先自定义一个简单具有 slot 功能的组件：

`slot-test.vue`

```html
<template>
  <div>
    <slot name="title"></slot>
    <ul>
      <slot name="item" v-for="item in items" :text="item"></slot>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    items: Array
  }
}
</script>
```

使用：
```html
<template>
  <slot-test :items="items">
    <h1 slot="title">组件标题</h1>
    <template slot="item" scope="props">
      <li>{{ props.text }}</li>
    </template>
  </slot-test>
</template>

<script>
export default {
  data () {
    return {
      items: [1, 2, 3]
    }
  }
}
</script>
```

<!--more-->

slot 很方便，但是...... 有时我们没办法直接用 slot 往组件里面塞自定义内容。

比如我们有时需要将 vue 的组件转换成一个工具函数来使用：

`util.vue`
```html
<template>
  <div class="cpt">
    <h1>{{ title }}</h1>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    title: String
  },

  methods: {
    todo () {
      console.log('to do someing~')
    }
  }
}
</script>
```


转成一个工具函数：

`util.js`

```javascript
import Vue from 'vue'
import main from './util.vue'

const Constructor = Vue.extend(main)

export default function util (options) {
  // 这里的 options 其实就是组件上 props
  const instance = new Constructor({ propsData: options }).$mount()
  document.body.appendChild(instance.$el)
  return instance
}
```

使用：
```javascript
const ins = util({ title: '工具函数哦~' })
ins.todo()
```

是不是没办法直接往里面塞 `slot` 了， 所以这里我们可能会倾向通过 `props` 传组件进行渲染，所以但组件作为工具函数使用时，我们可能会使用 `<component>` 组件。


可以看一波文档 [https://cn.vuejs.org/v2/api/#component](https://cn.vuejs.org/v2/api/#component)。

``component` 的 `is` 属性可以是： `string | ComponentDefinition | ComponentConstructor`


所以我们可以将组件写成这样：

`util.vue`

```html
<template>
  <div class="cpt">
    <h1>{{ title }}</h1>
    <component v-if="customCpt"
      :is="customCpt"
      v-bind="customProps">
    </component>
  </div>
</template>

<script>
export default {
  props: {
    title: String,

    customCpt: [String, Object],

    customProps: Object
  },

  methods: {
    todo () {
      console.log('to do someing~')
    }
  }
}
</script>
```

这里小小提示一下 `v-bind` 是可以直接绑定一个对象的。

平时我们可能会这样写：

`<cpt :name="name" :value="value"></cpt>`

但是可以通过 `v-bind`直接绑定一个对象：

```html
<cpt v-bind="{ name: 'name', value: 'value' }"></cpt>
```

两种写法是一样的，但是有的时候不考虑组件特定的 props 属性时，这样做会方便很多。


使用时，我们可以先自定义一个组件

`custom-cpt.vue`

```html
<template>
  <span>{{ name }}</span>
</template>

<script>
export default {
  props: {
    name: String
  }
}
</script>
```

然后在工具函数可以这样使用：

`util.js`

```javascript
import CustomCpt from 'components/custom-cpt.vue'
const ins = util({
  title: '工具函数哦~',
  customCpt: CustomCpt,
  customProps: { name: '我是自定义组件' }
})
ins.todo()
```

这样就可已通过将自定义的组件传入进行自定义渲染了。


然后我们再稍微改装一下，让自定义渲染函数也支持 `render` 函数：

`util.vue`

```html
<template>
  <div class="cpt">
    <h1>{{ title }}</h1>
    <component v-if="customCpt"
      :is="customCrater"
      v-bind="customProps">
    </component>
  </div>
</template>

<script>
export default {
  props: {
    title: String,

    customCpt: [String, Object, Function],

    customProps: Object
  },

  computed: {
    customCrater () {
      const customCpt = this.customCpt
      return typeof customCpt === 'function'
        ? { render: customCpt } // 其实就是将 render 函数包装成一个组件
        : customCpt
    }
  },

  methods: {
    todo () {
      console.log('to do someing~')
    }
  }
}
</script>
```

然后我们就可可以通过 render 函数进行自定义渲染：

`util.js`

```javascript
const ins = util({
  title: '工具函数哦~',
  customCpt (h) {
    return h('button', '自定义按钮')
  }
})
ins.todo()
```


解决完组件 props 问题，然后就是将组件内部事件处理了。

简单的处理方式就是通过 props 将事件处理一并函数传入：

`custom-cpt.vue`

```html
<template>
  <span @click="handler">{{ name }}</span>
</template>

<script>
export default {
  props: {
    name: String,
    handler: Function // 通过 props 将处理函数传入
  }
}
</script>
```

然后酱紫使用：

`util.js`

```javascript
const ins = util({
  title: '工具函数哦~',
  customCpt: CustomCpt,
  customProps: {
    name: '我是自定义组件',
    handler () {
      // 这里其实传入到了自定义的组将内部了
      alert('哈哈哈哈😁')
    }
  }
})
ins.todo()
```

内部组件 emit 的时间怎么处理呢？

`custom-cpt.vue`

```html
<template>
  <span @click="handler">{{ name }}</span>
</template>

<script>
export default {
  props: {
    name: String,
    handler: Function
  },

  mounted () {
    this.$emit('test') // 这里 emit 一个事件
  }
}
</script>
```

简单的方式就是通过全局的 `event bus`，来处理，不过组件内部的事件也只能写成 `event bus` 触发了，但可能有些同学不太喜欢这样做。

这里我们可以借用一下 v-on 的对象语法（[2.4 新增](https://cn.vuejs.org/v2/api/#v-on)）：

`utl.vue`

```html
<template>
  <div class="cpt">
    <h1>{{ title }}</h1>
    <component v-if="customCpt"
      :is="customCrater"
      v-bind="customProps"
      v-on="listeners">
      <!-- v-on="listeners" 直接绑定了一个配置对象 -->
    </component>
  </div>
</template>

<script>
export default {
  props: {
    title: String,

    customCpt: [String, Object, Function],

    customProps: Object,

    listeners: Object // v-on 绑定的时间监听对象
  },

  computed: {
    customCrater () {
      const customCpt = this.customCpt
      return typeof customCpt === 'function'
        ? { render: customCpt }
        : customCpt
    }
  },

  methods: {
    todo () {
      console.log('to do someing~')
    }
  }
}
</script>
```

使用时可以这样：

`util.js`

```javascript
import CustomCpt from 'components/custom-cpt.vue'
const ins = util({
  title: '工具函数哦~',
  customCpt: CustomCpt,
  customProps: {
    name: '我是自定义组件',
    handler () {
      alert('哈哈哈哈😁')
    }
  },
  // 这里可以配置内部组件的事件监听
  listeners: {
    test () {
      alert('test')
    }
    // .... 其他事件监听
  }
})
ins.todo()
```

`component` 真是一个很好用的组件，配合 `v-bind `v-on `$attrs 与 `$listeners` 这一类的用法简直无敌有没有。

嘛记录一些小想法，组件封装与 API 设计是门大学问。












